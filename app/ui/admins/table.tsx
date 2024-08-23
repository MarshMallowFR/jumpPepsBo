import { UpdateBtn } from '@/app/ui/common/buttons';
import { fetchFilteredAdmins } from '@/app/lib/data';
import Status from '../climbing/status';
import DeleteAdmin from './delete-admin';
import ToastContextProvider from '@/app/lib/contexts/toastContext';

export default async function AdminTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const admins = await fetchFilteredAdmins(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Nom et prénom
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Validé
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {admins?.map((admin) => (
                <tr
                  key={admin.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>
                        {admin.firstName} {admin.lastName}
                      </p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{admin.email}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <Status isValid={admin.validated} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateBtn href={`/dashboard/admins/${admin.id}/edit`} />
                      <ToastContextProvider>
                        <DeleteAdmin id={admin.id} />
                      </ToastContextProvider>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
