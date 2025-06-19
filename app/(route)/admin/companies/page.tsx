"use client";

import { Paginate, Title } from '@/components';
import { FilterCompanies, ListCompanies } from './components';
import { CompaniesProvider, useCompanies } from './context/CompaniesContext';

const CompaniesPagination = () => {
  
  const { meta, links, fetchCompanies, setPage } = useCompanies();

  const handlePageChange = (e: React.MouseEvent<HTMLButtonElement>, pageUrl: string) => {
    e.preventDefault();
    fetchCompanies(pageUrl);
    setPage(parseInt(pageUrl?.match(/page=(\d+)/)?.[1] || '1'));
  };

  return <Paginate meta={meta} links={links} reqNewPage={handlePageChange} />;
};

const PageAdminCustomers = () => {
  return (
    <CompaniesProvider>
      <div className="dark:text-gray-300">
        <Title
          title='Clientes'
          subTitle='Lista de todos los clientes'
          actions={[{ label: "", type: "link", url: "/admin/companies/create", action: "add" }]}
        />
        <div className="md:mx-8 py-4">
          <FilterCompanies />
          <ListCompanies />
          <CompaniesPagination />
        </div>
      </div>
    </CompaniesProvider>
  )
}

export default PageAdminCustomers;
