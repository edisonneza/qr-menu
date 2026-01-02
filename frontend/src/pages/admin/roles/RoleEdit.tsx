import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router';

import { getRoleById, updateRoleClaims } from '../../../api/role/RoleApi';
import { RoleWithClaims, RoleName } from '../../../models/Role';
import { UserClaim } from '../../../models/Claim';
import PageContainer from '../../PageContainer';
import useNotifications from '../../../hooks/useNotifications/useNotifications';

export default function RoleEdit() {
  const { roleId } = useParams<{ roleId: RoleName }>();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [role, setRole] = React.useState<RoleWithClaims | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const [selectedClaims, setSelectedClaims] = React.useState<Set<number>>(
    new Set()
  );
  const [hasChanges, setHasChanges] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!roleId) return;

    setIsLoading(true);
    setError(null);

    try {
      const roleData = await getRoleById(roleId);
      setRole(roleData);

      // Initialize selected claims
      const initialSelection = new Set<number>();
      roleData.detailed_claims?.forEach((claim) => {
        if (claim.has_claim) {
          initialSelection.add(claim.id);
        }
      });
      setSelectedClaims(initialSelection);
      setHasChanges(false);
    } catch (err) {
      setError(err as Error);
    }

    setIsLoading(false);
  }, [roleId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClaimToggle = React.useCallback((claimId: number) => {
    setSelectedClaims((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(claimId)) {
        newSet.delete(claimId);
      } else {
        newSet.add(claimId);
      }
      setHasChanges(true);
      return newSet;
    });
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!roleId) return;

    setIsSaving(true);

    try {
      const claimIds = Array.from(selectedClaims);
      const updatedRole = await updateRoleClaims(roleId, claimIds);

      setRole(updatedRole);
      setHasChanges(false);

      notifications.show(
        `Permissions for ${role?.title} updated successfully. This will affect all users with this role.`,
        {
          severity: 'success',
          autoHideDuration: 5000,
        }
      );

      // Navigate back to role view
      navigate(`/admin/roles/${roleId}`);
    } catch (err) {
      notifications.show(
        `Failed to update permissions: ${(err as Error).message}`,
        {
          severity: 'error',
          autoHideDuration: 5000,
        }
      );
    }

    setIsSaving(false);
  }, [roleId, selectedClaims, role, notifications, navigate]);

  const handleReset = React.useCallback(() => {
    if (!role) return;

    const originalSelection = new Set<number>();
    role.detailed_claims?.forEach((claim) => {
      if (claim.has_claim) {
        originalSelection.add(claim.id);
      }
    });
    setSelectedClaims(originalSelection);
    setHasChanges(false);
  }, [role]);

  const handleBack = React.useCallback(() => {
    navigate(`/admin/roles/${roleId}`);
  }, [navigate, roleId]);

  // Group claims by resource
  const groupedClaims = React.useMemo(() => {
    if (!role?.detailed_claims) return {};

    const groups: { [resource: string]: UserClaim[] } = {};
    role.detailed_claims.forEach((claim) => {
      if (!groups[claim.resource]) {
        groups[claim.resource] = [];
      }
      groups[claim.resource].push(claim);
    });

    return groups;
  }, [role]);

  // Filter claims based on search
  const filteredGroups = React.useMemo(() => {
    if (!searchTerm) return groupedClaims;

    const filtered: { [resource: string]: UserClaim[] } = {};
    const searchLower = searchTerm.toLowerCase();

    Object.entries(groupedClaims).forEach(([resource, resourceClaims]) => {
      const matchingClaims = resourceClaims.filter(
        (claim) =>
          claim.name.toLowerCase().includes(searchLower) ||
          claim.action.toLowerCase().includes(searchLower) ||
          claim.description?.toLowerCase().includes(searchLower) ||
          resource.toLowerCase().includes(searchLower)
      );

      if (matchingClaims.length > 0) {
        filtered[resource] = matchingClaims;
      }
    });

    return filtered;
  }, [groupedClaims, searchTerm]);

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
        title="Edit Role"
        breadcrumbs={[
          { title: 'Roles', path: '/admin/roles' },
          { title: 'Edit' },
        ]}
      >
        <Alert severity="error">{error?.message || 'Role not found'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Edit ${role.title} Permissions`}
      breadcrumbs={[
        { title: 'Roles', path: '/admin/roles' },
        { title: role.title, path: `/admin/roles/${roleId}` },
        { title: 'Edit' },
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {role.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {role.description}
                </Typography>
                <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                  ⚠️ Changes will affect all {role.total_users} users with this role
                </Typography>
              </Box>
              <Chip
                label={`${selectedClaims.size} permissions`}
                color="primary"
                size="medium"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Permissions Grid */}
        <Stack spacing={3}>
          {Object.entries(filteredGroups).map(([resource, resourceClaims]) => (
            <Paper key={resource} sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textTransform: 'capitalize', mb: 2 }}
              >
                {resource}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {resourceClaims.map((claim) => (
                  <Grid item xs={12} sm={6} md={4} key={claim.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedClaims.has(claim.id)}
                          onChange={() => handleClaimToggle(claim.id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {claim.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {claim.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
        </Stack>

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Stack>

        {hasChanges && (
          <Alert severity="warning">
            You have unsaved changes. Click "Save Changes" to apply them to all users with this role.
          </Alert>
        )}
      </Box>
    </PageContainer>
  );
}
