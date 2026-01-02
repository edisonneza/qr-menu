import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';

import { getRoles } from '../../../api/role/RoleApi';
import { Role } from '../../../models/Role';
import PageContainer from '../../PageContainer';

export default function RoleList() {
  const navigate = useNavigate();

  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRoles();
      setRoles(data.items);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowClick = React.useCallback(
    (params: GridRowParams) => {
      navigate(`/admin/roles/${params.row.role}`);
    },
    [navigate]
  );

  const columns: GridColDef[] = [
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
            {params.row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 250,
    },
    {
      field: 'user_count',
      headerName: 'Users',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'claim_count',
      headerName: 'Permissions',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="secondary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'color',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.role}
          size="small"
          color={params.value}
          sx={{ textTransform: 'capitalize' }}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Roles & Permissions"
      breadcrumbs={[{ title: 'Roles' }]}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Manage default permissions for each role. Changes affect all users with that role.
          </Typography>
        </Box>

        <DataGrid
          rows={roles}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.role}
          onRowClick={handleRowClick}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
            },
          }}
        />
      </Box>
    </PageContainer>
  );
}
