import React, { useEffect, useState } from 'react';
import { Page, DataTable } from "@shopify/polaris";


const Index = (props) => {

  const [customers, setCustomers] = useState([]);

  useEffect(() => {

    async function getCsutomers() {

      try {

        let url = 'http://localhost:8081/api/customers'
        let resp = await fetch(url)
        resp = await resp.json()

        setCustomers([...resp.data]) //set Customers state

      } catch (err) {
        console.log('Unable to fetch customers data', err.message)
      }

    }

    getCsutomers();

  }, [])

  return (

    (customers.length > 0) && <Page title="Customers Data by RFM">

      <DataTable
        columnContentTypes={[
          'text',
          'text',
          'text',
          'text',
          'text',
          'Numeric',
          'text',
          'Numeric',
          'Numeric',
        ]}
        headings={[
          'First Name',
          'Last Name',
          'Email',
          'Phone',
          'Last Order ID',
          'Orders Count',
          'Total Spent',
          'Rating'
        ]}
        rows={customers}
      />

    </Page>
  )
};

export default Index;
