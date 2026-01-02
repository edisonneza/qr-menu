import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';

import { getRoleById, updateRoleMetadata } from '../../../api/role/RoleApi';
import { RoleWithClaims, RoleName } from '../../../models/Role';
import PageContainer from '../../PageContainer';
import useNotifications from '../../../hooks/useNotifications/useNotifications';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const COLOR_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'error', label: 'Red' },
  { value: 'warning', label: 'Orange' },
  { value: 'info', label: 'Blue' },
  { value: 'success', label: 'Green' },
];

export default function RoleEditDetails() {
  const { roleId } = useParams<{ roleId: RoleName }>();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [role, setRole] = React.useState<RoleWithClaims | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState('default');
  const [hasChanges, setHasChanges] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!roleId) return;

    setIsLoading(true);
    setError(null);

    try {
      const roleData = await getRoleById(roleId);
      setRole(roleData);
      setTitle(roleData.title || '');
      setDescription(roleData.description || '');
      setColor(roleData.color || 'default');
      setHasChanges(false);
    } catch (err) {
      setError(err as Error);
    }

    setIsLoading(false);
  }, [roleId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = React.useCallback(async () => {
    if (!roleId) return;

    setIsSaving(true);

    try {
      const updatedRole = await updateRoleMetadata(roleId, {
        title,
        description,
        color,
      });

      setRole(updatedRole);
      setHasChanges(false);

      notifications.show(`Role details updated successfully`, {
        severity: 'success',
      });

      // Navigate back to view page
      navigate(`/admin/roles/${roleId}`);
    } catch (err) {
      notifications.show(
        (err as Error).message || 'Failed to update role details',
        {
          severity: 'error',
        }
      );
    }

    setIsSaving(false);
  }, [roleId, title, description, color, notifications, navigate]);

  const handleCancel = React.useCallback(() => {
    navigate(`/admin/roles/${roleId}`);
  }, [navigate, roleId]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !role) {
    return (
      <PageContainer
        title="Role Not Found"
        breadcrumbs={[
          { title: 'Roles', path: '/admin/roles' },
          { title: 'Error' },
        ]}
      >
        <Alert severity="error">{error?.message || 'Role not found'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Edit ${role.title} Details`}
      breadcrumbs={[
        { title: 'Roles', path: '/admin/roles' },
        { title: role.title, path: `/admin/roles/${roleId}` },
        { title: 'Edit Details' },
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="info">
          Changes to role details (title, description, color) will be reflected
          immediately across the system.
        </Alert>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6" gutterBottom>
                Role Details
              </Typography>

              <TextField
                label="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasChanges(true);
                }}
                fullWidth
                required
                helperText="Display name for this role"
              />

              <TextField
                label="Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setHasChanges(true);
                }}
                fullWidth
                multiline
                rows={3}
                helperText="Brief description of this role's purpose"
              />

              <FormControl fullWidth>
                <InputLabel>Color Theme</InputLabel>
                <Select
                  value={color}
                  label="Color Theme"
                  onChange={(e) => {
                    setColor(e.target.value);
                    setHasChanges(true);
                  }}
                >
                  {COLOR_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Note: Role name "{roleId}" cannot be changed as it's used as an
                  identifier throughout the system.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            color="primary"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>
    </PageContainer>
  );
}
