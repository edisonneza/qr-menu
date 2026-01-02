import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate, useParams } from 'react-router';

import { getRoleById, getRoleUsers } from '../../../api/role/RoleApi';
import { RoleWithClaims, RoleName, RoleUser } from '../../../models/Role';
import PageContainer from '../../PageContainer';
import useNotifications from '../../../hooks/useNotifications/useNotifications';

export default function RoleView() {
  const { roleId } = useParams<{ roleId: RoleName }>();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [role, setRole] = React.useState<RoleWithClaims | null>(null);
  const [users, setUsers] = React.useState<RoleUser[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [activeTab, setActiveTab] = React.useState(0);

  const loadData = React.useCallback(async () => {
    if (!roleId) return;

    setError(null);
    setIsLoading(true);

    try {
      const [roleData, usersData] = await Promise.all([
        getRoleById(roleId),
        getRoleUsers(roleId),
      ]);

      setRole(roleData);
      setUsers(usersData || []);
    } catch (loadError) {
      setError(loadError as Error);
    }
    setIsLoading(false);
  }, [roleId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBack = React.useCallback(() => {
    navigate('/admin/roles');
  }, [navigate]);

  const handleEdit = React.useCallback(() => {
    navigate(`/admin/roles/${roleId}/edit`);
  }, [navigate, roleId]);

  const handleEditDetails = React.useCallback(() => {
    navigate(`/admin/roles/${roleId}/edit-details`);
  }, [navigate, roleId]);

  const handleTabChange = React.useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  // Group claims by resource
  const groupedClaims = React.useMemo(() => {
    if (!role) return {};

    const groups: { [resource: string]: typeof role.claims } = {};
    role.claims.forEach((claim) => {
      if (!groups[claim.resource]) {
        groups[claim.resource] = [];
      }
      groups[claim.resource].push(claim);
    });

    return groups;
  }, [role]);

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
        breadcrumbs={[{ title: 'Roles', path: '/admin/roles' }, { title: 'Error' }]}
      >
        <Alert severity="error">{error?.message || 'Role not found'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={role.title}
      breadcrumbs={[
        { title: 'Roles', path: '/admin/roles' },
        { title: role.title },
      ]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header Stats */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Total Users
              </Typography>
              <Typography variant="h4">{role.total_users}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Active Users
              </Typography>
              <Typography variant="h4">{role.active_users}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Permissions
              </Typography>
              <Typography variant="h4">{role.claim_count}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Description */}
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              {role.description}
            </Typography>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Paper>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Permissions" />
            <Tab label="Users" />
          </Tabs>
        </Paper>

        {/* Permissions Tab */}
        {activeTab === 0 && (
          <Stack spacing={3}>
            {Object.entries(groupedClaims).map(([resource, resourceClaims]) => (
              <Paper key={resource} sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ textTransform: 'capitalize', mb: 2 }}
                >
                  {resource}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  {resourceClaims.map((claim) => (
                    <Grid item key={claim.id}>
                      <Chip
                        label={claim.action}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Users Tab */}
        {activeTab === 1 && (
          <Card>
            <CardContent>
              {!users || users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No users assigned to this role yet
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {users.map((user) => (
                    <Paper
                      key={user.id}
                      sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <Chip
                        label={user.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.is_active ? 'success' : 'default'}
                      />
                      <Button
                        size="small"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        View
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditDetails}
            >
              Edit Details
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
              color="primary"
            >
              Edit Permissions
            </Button>
          </Stack>
        </Stack>
      </Box>
    </PageContainer>
  );
}
