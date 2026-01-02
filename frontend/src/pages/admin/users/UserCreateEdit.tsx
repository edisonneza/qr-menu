import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router';
import UserForm, { FormFieldValue, UserFormState } from '../../../components/admin/user/UserForm';
import useNotifications from '../../../hooks/useNotifications/useNotifications';
import { validateUser } from '../../../utils/user/userUtils';
import { User } from '../../../models/User';
import { getUserById, updateUser, createUser } from '../../../api/user/UserApi';
import PageContainer from '../../PageContainer';

const INITIAL_FORM_VALUES: Partial<UserFormState['values']> = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'staff',
  is_active: true,
};

export default function UserCreateEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const isEditMode = Boolean(userId);

  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(isEditMode);
  const [error, setError] = React.useState<Error | null>(null);

  const [formState, setFormState] = React.useState<UserFormState>(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));

  const formValues = formState.values;
  const formErrors = formState.errors;

  // Load user data if in edit mode
  const loadData = React.useCallback(async () => {
    if (!userId) return;

    setError(null);
    setIsLoading(true);

    try {
      const userData = await getUserById(Number(userId));
      setUser(userData);
      setFormState({
        values: userData,
        errors: {},
      });
    } catch (loadError) {
      setError(loadError as Error);
    }
    setIsLoading(false);
  }, [userId]);

  React.useEffect(() => {
    if (isEditMode) {
      loadData();
    }
  }, [isEditMode, loadData]);

  const setFormValues = React.useCallback(
    (newFormValues: Partial<UserFormState['values']>) => {
      setFormState((previousState) => ({
        ...previousState,
        values: newFormValues,
      }));
    },
    [],
  );

  const setFormErrors = React.useCallback(
    (newFormErrors: Partial<UserFormState['errors']>) => {
      setFormState((previousState) => ({
        ...previousState,
        errors: newFormErrors,
      }));
    },
    [],
  );

  const handleFormFieldChange = React.useCallback(
    (name: keyof UserFormState['values'], value: FormFieldValue) => {
      const validateField = async (values: Partial<UserFormState['values']>) => {
        const { issues } = validateUser(values, !isEditMode);
        setFormErrors({
          ...formErrors,
          [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
        });
      };

      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);
      validateField(newFormValues);
    },
    [formValues, formErrors, isEditMode, setFormErrors, setFormValues],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(isEditMode && user ? user : INITIAL_FORM_VALUES);
  }, [isEditMode, user, setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateUser(formValues, !isEditMode);
    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
      );
      return;
    }
    setFormErrors({});

    try {
      if (isEditMode) {
        // Update existing user
        const updatedData = await updateUser(Number(userId), formValues as UserFormState);
        setUser(updatedData);
        notifications.show('User updated successfully.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
        navigate(`/admin/users/${userId}`);
      } else {
        // Create new user
        const newUser = await createUser(formValues as UserFormState);
        notifications.show('User created successfully.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
        navigate(`/admin/users/${newUser.id}`);
      }
    } catch (submitError) {
      notifications.show(
        `Failed to ${isEditMode ? 'update' : 'create'} user. Reason: ${(submitError as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw submitError;
    }
  }, [formValues, isEditMode, userId, navigate, notifications, setFormErrors]);

  const pageTitle = isEditMode ? `Edit User ${userId}` : 'New User';
  const breadcrumbs = isEditMode
    ? [
        { title: 'Users', path: '/admin/users' },
        { title: `User ${userId}`, path: `/admin/users/${userId}` },
        { title: 'Edit' },
      ]
    : [{ title: 'Users', path: '/admin/users' }, { title: 'New' }];

  const renderContent = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    return (
      <UserForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel={isEditMode ? 'Save' : 'Create'}
        backButtonPath={isEditMode ? `/admin/users/${userId}` : '/admin/users'}
        isEditMode={isEditMode}
      />
    );
  }, [
    isLoading,
    error,
    formState,
    handleFormFieldChange,
    handleFormSubmit,
    handleFormReset,
    isEditMode,
    userId,
  ]);

  return (
    <PageContainer title={pageTitle} breadcrumbs={breadcrumbs}>
      <Box sx={{ display: 'flex', flex: 1 }}>{renderContent}</Box>
    </PageContainer>
  );
}
