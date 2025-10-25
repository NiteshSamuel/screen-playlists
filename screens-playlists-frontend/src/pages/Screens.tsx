import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Screens() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 🔍 Search + pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['screens', search, page],
    queryFn: async () => {
      const res = await api.get(`/screens?search=${search}&page=${page}&limit=${limit}`);
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => await api.put(`/screens/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['screens'] }),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Screens</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playlists')}
            className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          >
            Playlists
          </button>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex mb-4 gap-2">
        <input
          type="text"
          placeholder="Search screens..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded p-2 flex-grow"
        />
        <button
          onClick={() => {
            setPage(1);
            refetch();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* Table */}
      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      )}

      {isError && <p className="text-red-500">Failed to load screens.</p>}

      {data && (
        <>
          <table className="w-full border bg-white rounded shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((s: any) => (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.isActive ? '✅' : '❌'}</td>
                  <td className="p-3">
                    {['EDITOR', 'ADMIN'].includes(user?.role || '') && (
                      <button
                        onClick={() => toggleMutation.mutate(s._id)}
                        disabled={toggleMutation.isPending}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {toggleMutation.isPending ? '...' : 'Toggle'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page <b>{page}</b> / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
