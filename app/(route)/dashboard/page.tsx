import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Tu archivo de config de auth
import getAxiosAuthServer from "@/lib/axios/getAxiosAuthServer";
import { ReportChartMonth } from "./components/ReportChartMonth";
import { FaCar, FaFileCirclePlus, FaUserAstronaut, FaUsers } from "react-icons/fa6";
import { redirect } from "next/navigation";

const InvoicesPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  const axiosAuth = getAxiosAuthServer(session);
  const { data } = await axiosAuth.get("/dashboard");

  return (
    <div className="dark:text-gray-300">

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full justify-between p-6 gap-6">

        {/* Card 1 */}
        <article className="flex flex-col w-full rounded justify-center items-center bg-linear-to-r from-sky-400 via-sky-400/75 to-sky-400 gap-4 py-8">
          <div className="rounded-full block bg-sky-200/50 p-4 text-white text-3xl">
            <FaFileCirclePlus />
          </div>
          <h2 className="text-white text-4xl py-2 font-bold">{data.count_orders}</h2>
          <p className="text-sky-100 text-xl">Ventas</p>
        </article>

        {/* Card 2 */}
        <article className="flex flex-col w-full rounded justify-center items-center bg-linear-to-t from-blue-900 via-blue-900/75 to-blue-900 gap-4 py-8">
          <div className="rounded-full block bg-blue-200/50 p-4 text-white text-3xl">
            <FaCar />
          </div>
          <h2 className="text-white text-4xl py-2 font-bold">{data.count_shops}</h2>
          <p className="text-blue-100 text-xl">Compras</p>
        </article>

        {/* Card 3 */}
        <article className="flex flex-col w-full rounded justify-center items-center bg-linear-to-r from-green-600 via-green-600/75 to-green-600 gap-4 py-8">
          <div className="rounded-full block bg-green-200/50 p-4 text-white text-3xl">
            <FaUsers />
          </div>
          <h2 className="text-white text-4xl py-2 font-bold">{data.count_customers}</h2>
          <p className="text-green-100 text-xl">Clientes</p>
        </article>

        {/* Card 4 */}
        <article className="flex flex-col w-full rounded justify-center items-center bg-linear-to-b from-red-500 via-red-500/75 to-red-500 gap-4 py-8">
          <div className="rounded-full block bg-red-200/50 p-4 text-white text-3xl">
            <FaUserAstronaut />
          </div>
          <h2 className="text-white text-4xl py-2 font-bold">{data.count_providers}</h2>
          <p className="text-red-100 text-xl">Proveedores</p>
        </article>

      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6 px-6 pb-6">
        <ReportChartMonth items={data.orders} color="#4e4376" title="Ventas" />
        <ReportChartMonth items={data.shops} color="#2FA4E7" title="Compras" />
      </div>

    </div>
  );
};

export default InvoicesPage;