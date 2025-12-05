import * as React from 'react';
import { useNavigate } from 'react-router';
// import {
//   createOne as createUser,
//   validate as validateUser,
//   type User,
// } from '../data/users';
import useNotifications from '../../../hooks/useNotifications/useNotifications';
import PageContainer from '../../PageContainer';
import UserForm, { FormFieldValue, UserFormState } from '../../../components/admin/user/UserForm';
import { User } from '../../../models/User';
import { validateUser } from '../../../utils/user/userUtils';
import { createUser } from '../../../api/user/UserApi';

const INITIAL_FORM_VALUES: Partial<UserFormState['values']> = {
    email: 'test@gmail.com',
    isActive: true,
};

export default function UserCreate() {
    const navigate = useNavigate();

    const notifications = useNotifications();

    const [formState, setFormState] = React.useState<UserFormState>(() => ({
        values: INITIAL_FORM_VALUES,
        errors: {},
    }));
    const formValues = formState.values;
    const formErrors = formState.errors;

    const setFormValues = React.useCallback(
        (newFormValues: Partial<UserFormState['values']>) => {
            setFormState((previousState: UserFormState) => ({
                ...previousState,
                values: newFormValues,
            }));
        },
        [],
    );

    const setFormErrors = React.useCallback(
        (newFormErrors: Partial<UserFormState['errors']>) => {
            setFormState((previousState: UserFormState) => ({
                ...previousState,
                errors: newFormErrors,
            }));
        },
        [],
    );

    const handleFormFieldChange = React.useCallback(
        (name: keyof UserFormState['values'], value: FormFieldValue) => {
            const validateField = async (values: Partial<UserFormState['values']>) => {
                const { issues } = validateUser(values);
                setFormErrors({
                    ...formErrors,
                    [name]: issues?.find((issue: any) => issue.path?.[0] === name)?.message,
                });
            };

            const newFormValues = { ...formValues, [name]: value };

            setFormValues(newFormValues);
            validateField(newFormValues);
        },
        [formValues, formErrors, setFormErrors, setFormValues],
    );

    const handleFormReset = React.useCallback(() => {
        setFormValues(INITIAL_FORM_VALUES);
    }, [setFormValues]);

    const handleFormSubmit = React.useCallback(async () => {
        const { issues } = validateUser(formValues);
        if (issues && issues.length > 0) {
            setFormErrors(
                Object.fromEntries(issues.map((issue: any) => [issue.path?.[0], issue.message])),
            );
            return;
        }
        setFormErrors({});

        try {
            debugger;
            var response = await createUser(formValues as UserFormState);
            if (!response.success) {
                notifications.show(response.message, {
                    severity: 'error',
                    autoHideDuration: 3000,
                });
            }
            notifications.show('User created successfully.', {
                severity: 'success',
                autoHideDuration: 3000,
            });

            navigate('/users');
        } catch (createError) {
            notifications.show(
                `Failed to create user. Reason: ${(createError as Error).message}`,
                {
                    severity: 'error',
                    autoHideDuration: 3000,
                },
            );
            throw createError;
        }
    }, [formValues, navigate, notifications, setFormErrors]);

    return (
        <PageContainer
            title="New User"
            breadcrumbs={[{ title: 'Users', path: '/users' }, { title: 'New' }]}
        >
            <UserForm
                formState={formState}
                onFieldChange={handleFormFieldChange}
                onSubmit={handleFormSubmit}
                onReset={handleFormReset}
                submitButtonLabel="Create"
            />
        </PageContainer>
    );
}
