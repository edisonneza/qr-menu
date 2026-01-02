import * as React from 'react';
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
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import dayjs from 'dayjs';

import { getUserClaims, updateUserClaims } from '../../../api/claims/ClaimsApi';
import { UserClaim, ClaimAuditLog } from '../../../models/Claim';
import useNotifications from '../../../hooks/useNotifications/useNotifications';

interface UserPermissionsProps {
  userId: number;
  userName: string;
  userRole: string;
  onUpdate?: () => void;
}

export default function UserPermissions({
  userId,
  userName,
  userRole,
  onUpdate,
}: UserPermissionsProps) {
  const notifications = useNotifications();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showAuditLog, setShowAuditLog] = React.useState(false);

  const [claims, setClaims] = React.useState<UserClaim[]>([]);
  const [auditLog, setAuditLog] = React.useState<ClaimAuditLog[]>([]);
  const [selectedClaims, setSelectedClaims] = React.useState<Set<number>>(
    new Set()
  );
  const [hasChanges, setHasChanges] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserClaims(userId);
      setClaims(data.claims);
      setAuditLog(data.audit_log);

      // Initialize selected claims
      const initialSelection = new Set<number>();
      data.claims.forEach((claim) => {
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
  }, [userId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleClaimToggle = React.useCallback(
    (claimId: number) => {
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
    },
    []
  );

  const handleSave = React.useCallback(async () => {
    setIsSaving(true);

    try {
      const claimIds = Array.from(selectedClaims);
      const data = await updateUserClaims(userId, claimIds);

      setClaims(data.claims);
      setAuditLog(data.audit_log);
      setHasChanges(false);

      notifications.show('Permissions updated successfully', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      if (onUpdate) {
        onUpdate();
      }
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
  }, [userId, selectedClaims, notifications, onUpdate]);

  const handleReset = React.useCallback(() => {
    const originalSelection = new Set<number>();
    claims.forEach((claim) => {
      if (claim.has_claim) {
        originalSelection.add(claim.id);
      }
    });
    setSelectedClaims(originalSelection);
    setHasChanges(false);
  }, [claims]);

  // Group claims by resource
  const groupedClaims = React.useMemo(() => {
    const groups: { [resource: string]: UserClaim[] } = {};

    claims.forEach((claim) => {
      const resource = claim.resource;
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(claim);
    });

    return groups;
  }, [claims]);

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

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            Manage Permissions for {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Role: <Chip label={userRole} size="small" sx={{ textTransform: 'capitalize' }} />
          </Typography>
        </Box>
        <Button
          variant={showAuditLog ? 'contained' : 'outlined'}
          startIcon={<HistoryIcon />}
          onClick={() => setShowAuditLog(!showAuditLog)}
          size="small"
        >
          {showAuditLog ? 'Hide' : 'Show'} Audit Log
        </Button>
      </Stack>

      {/* Audit Log */}
      {showAuditLog && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Permission Change History
            </Typography>
            {auditLog.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No permission changes recorded yet.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Permission</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Modified By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLog.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {dayjs(log.created_at).format('MMM D, YYYY HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {log.claim_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.claim_description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action}
                            size="small"
                            color={log.action === 'granted' ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.modified_by_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.modified_by_email}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search permissions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
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
                        {claim.source === 'role_default' && (
                          <Chip
                            label="Role Default"
                            size="small"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
                        {claim.source === 'override' && (
                          <Chip
                            label="Custom"
                            size="small"
                            color="primary"
                            sx={{ ml: 1, height: 20 }}
                          />
                        )}
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
        justifyContent="flex-end"
        sx={{ mt: 3 }}
      >
        <Button variant="outlined" onClick={handleReset} disabled={!hasChanges || isSaving}>
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

      {hasChanges && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          You have unsaved changes. Click "Save Changes" to apply them.
        </Alert>
      )}
    </Box>
  );
}
