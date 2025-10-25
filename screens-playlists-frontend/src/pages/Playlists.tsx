import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Playlists() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [urls, setUrls] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['playlists', search, page],
    queryFn: async () => {
      const res = await api.get(`/playlists?search=${search}&page=${page}&limit=${limit}`);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      await api.post('/playlists', {
        name,
        itemUrls: urls
          .split('\n')
          .map(u => u.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setName('');
      setUrls('');
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Playlists</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/screens')}
            className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          >
            Screens
          </button>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex mb-4 gap-2">
        <input
          type="text"
          placeholder="Search playlists..."
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

      {/* Create form */}
      {['EDITOR', 'ADMIN'].includes(user?.role || '') && (
        <form
          onSubmit={e => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="bg-white p-4 rounded shadow-sm mb-6"
        >
          <h3 className="font-semibold mb-2">Create Playlist</h3>
          <input
            className="border p-2 w-full mb-2 rounded"
            placeholder="Playlist name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea
            className="border p-2 w-full mb-2 rounded"
            rows={4}
            placeholder="One URL per line (max 10)"
            value={urls}
            onChange={e => setUrls(e.target.value)}
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {/* Table */}
      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      )}

      {isError && <p className="text-red-500">Failed to load playlists.</p>}

      {data && (
        <>
          <table className="w-full border bg-white rounded shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Item Count</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((p: any) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.itemCount}</td>
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
