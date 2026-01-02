import {
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { UserFormState } from "../../components/admin/user/UserForm";
import { Response } from "../../models/Response";
import { User } from "../../models/User";
import api from "../axios";

const getUsers = async ({
  paginationModel,
  filterModel,
  sortModel,
}: {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}): Promise<{ items: User[]; itemCount: number }> => {
  const token = localStorage.getItem("token");

  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const r = await api.get("/admin/users", {
    params: {
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      filter: JSON.stringify(filterModel),
      sort: JSON.stringify(sortModel),
    },
  });

  return r.data.data;
};

const getUserById = async (id: number) => {
  const r = await api.get(`/admin/users/${id}`);
  return r.data;
};

const deleteUser = async (id: number) => {
  const r = await api.delete(`/admin/users/${id}`);
  return r;
};

const updateUser = async (
  id: number,
  data: UserFormState
): Promise<Response<User>> => {
  const r = (await api.put(`/admin/users/${id}`, data)) as Response<User>;
  return r;
};

const createUser = async (data: UserFormState): Promise<Response<User>> => {
  const r = (await api.post("/admin/users", data)) as Response<User>;
  return r;
};

export { getUsers, getUserById, deleteUser, updateUser, createUser };
