import { sql } from '@vercel/postgres';
import { unstable_noStore as noStore } from 'next/cache';

import { MemberDB, LegalContactDB, Member } from './types/climbing';
import { Section } from './types/section';
import { AdminDB } from './types/admins';

// export async function fetchRevenue() {
//   // Add noStore() here prevent the response from being cached.
//   // This is equivalent to in fetch(..., {cache: 'no-store'}).
//   noStore();

//   try {
//     // Artificially delay a reponse for demo purposes.
//     // Don't do this in real life :)

//     console.log('Fetching revenue data...');
//     await new Promise((resolve) => setTimeout(resolve, 3000));

//     const data = await sql<Revenue>`SELECT * FROM revenue`;

//     console.log('Data fetch complete after 3 seconds.');

//     return data.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch revenue data.');
//   }
// }

// export async function fetchLatestInvoices() {
//   noStore();

//   try {
//     const data = await sql<LatestInvoiceRaw>`
//       SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       ORDER BY invoices.date DESC
//       LIMIT 5`;

//     const latestInvoices = data.rows.map((invoice) => ({
//       ...invoice,
//       amount: formatCurrency(invoice.amount),
//     }));
//     return latestInvoices;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch the latest invoices.');
//   }
// }

// export async function fetchCardData() {
//   noStore();

//   try {
//     // You can probably combine these into a single SQL query
//     // However, we are intentionally splitting them to demonstrate
//     // how to initialize multiple queries in parallel with JS.
//     const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
//     const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
//     const invoiceStatusPromise = sql`SELECT
//          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
//          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
//          FROM invoices`;

//     const data = await Promise.all([
//       invoiceCountPromise,
//       customerCountPromise,
//       invoiceStatusPromise,
//     ]);

//     const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
//     const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
//     const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
//     const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

//     return {
//       numberOfCustomers,
//       numberOfInvoices,
//       totalPaidInvoices,
//       totalPendingInvoices,
//     };
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to card data.');
//   }
// }

// export async function fetchFilteredInvoices(
//   query: string,
//   currentPage: number,
// ) {
//   noStore();

//   const offset = (currentPage - 1) * ITEMS_PER_PAGE;

//   try {
//     const invoices = await sql<InvoicesTable>`
//       SELECT
//         invoices.id,
//         invoices.amount,
//         invoices.date,
//         invoices.status,
//         customers.name,
//         customers.email,
//         customers.image_url
//       FROM invoices
//       JOIN customers ON invoices.customer_id = customers.id
//       WHERE
//         customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`} OR
//         invoices.amount::text ILIKE ${`%${query}%`} OR
//         invoices.date::text ILIKE ${`%${query}%`} OR
//         invoices.status ILIKE ${`%${query}%`}
//       ORDER BY invoices.date DESC
//       LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
//     `;

//     return invoices.rows;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch invoices.');
//   }
// }

// export async function fetchInvoicesPages(query: string) {
//   noStore();

//   try {
//     const count = await sql`SELECT COUNT(*)
//     FROM invoices
//     JOIN customers ON invoices.customer_id = customers.id
//     WHERE
//       customers.name ILIKE ${`%${query}%`} OR
//       customers.email ILIKE ${`%${query}%`} OR
//       invoices.amount::text ILIKE ${`%${query}%`} OR
//       invoices.date::text ILIKE ${`%${query}%`} OR
//       invoices.status ILIKE ${`%${query}%`}
//   `;

//     const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
//     return totalPages;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch total number of invoices.');
//   }
// }

// export async function fetchInvoiceById(id: string) {
//   noStore();

//   try {
//     const data = await sql<InvoiceForm>`
//       SELECT
//         invoices.id,
//         invoices.customer_id,
//         invoices.amount,
//         invoices.status
//       FROM invoices
//       WHERE invoices.id = ${id};
//     `;

//     const invoice = data.rows.map((invoice) => ({
//       ...invoice,
//       // Convert amount from cents to dollars
//       amount: invoice.amount / 100,
//     }));

//     return invoice[0];
//   } catch (error) {
//     console.error('Database Error:', error);
//   }
// }

// export async function fetchCustomers() {
//   noStore();

//   try {
//     const data = await sql<CustomerField>`
//       SELECT
//         id,
//         name
//       FROM customers
//       ORDER BY name ASC
//     `;

//     const customers = data.rows;
//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch all customers.');
//   }
// }

// export async function fetchFilteredCustomers(query: string) {
//   noStore();

//   try {
//     const data = await sql<CustomersTable>`
// 		SELECT
// 		  customers.id,
// 		  customers.name,
// 		  customers.email,
// 		  customers.image_url,
// 		  COUNT(invoices.id) AS total_invoices,
// 		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
// 		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
// 		FROM customers
// 		LEFT JOIN invoices ON customers.id = invoices.customer_id
// 		WHERE
// 		  customers.name ILIKE ${`%${query}%`} OR
//         customers.email ILIKE ${`%${query}%`}
// 		GROUP BY customers.id, customers.name, customers.email, customers.image_url
// 		ORDER BY customers.name ASC
// 	  `;

//     const customers = data.rows.map((customer) => ({
//       ...customer,
//       total_pending: formatCurrency(customer.total_pending),
//       total_paid: formatCurrency(customer.total_paid),
//     }));

//     return customers;
//   } catch (err) {
//     console.error('Database Error:', err);
//     throw new Error('Failed to fetch customer table.');
//   }
// }

/**
 *
 * JUMP PEPS
 */

const ITEMS_PER_PAGE = 6;

export async function fetchSections() {
  noStore();

  try {
    const data = await sql<Section>`
      SELECT
        id,
        name
      FROM sections
      ORDER BY name ASC
    `;

    const sections = data.rows.map((section) => ({
      ...section,
      href: `/dashboard/${section.name}`,
    }));
    return sections;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all sections.');
  }
}

export async function fetchClimbPages() {
  noStore();
  try {
    const { rows } = await sql`SELECT id FROM sections WHERE name = 'climbing'`;
    const count = await sql`SELECT COUNT(member_id) AS total_members
    FROM member_section_season
    WHERE season_id = '40c21821-8d67-4f3e-a8a4-e005a4e8078e' AND section_id = ${rows[0].id};
  `;

    return Math.ceil(Number(count.rowCount) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members');
  }
}

export async function fetchFilteredClimbingMembers(
  query: string,
  currentPage: number,
) {
  noStore();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const members = await sql<MemberDB>`
      SELECT
        *
      FROM members
      WHERE
        members.first_name ILIKE ${`%${query}%`} OR
        members.last_name ILIKE ${`%${query}%`}
      ORDER BY members.last_name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return members.rows.map((member) => ({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      birthDate: member.birth_date,
      email: member.email,
      phoneNumber: member.phone_number,
      street: member.street,
      zipCode: member.zip_code,
      city: member.city,
      picture: member.picture,
      isMediaCompliant: member.is_media_compliant,
      hasPaid: member.has_paid,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members.');
  }
}

export async function fetchClimbingMemberById(id: string) {
  noStore();

  try {
    const { rows } = await sql<MemberDB>`
      SELECT
        *
      FROM members
      WHERE members.id = ${id};
    `;

    let legalContact: LegalContactDB | undefined = undefined;

    if (rows[0].legal_contact_id) {
      const dataLegalContact = await sql<LegalContactDB>`
        SELECT
          *
        FROM legal_contacts
        WHERE legal_contacts.id = ${rows[0].legal_contact_id};
      `;

      legalContact = dataLegalContact.rows[0];
    }

    return rows.map((member) => ({
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      birthDate: member.birth_date,
      email: member.email,
      phoneNumber: member.phone_number,
      street: member.street,
      zipCode: member.zip_code,
      city: member.city,
      picture: member.picture,
      isMediaCompliant: member.is_media_compliant,
      hasPaid: member.has_paid,
      legalContactId: member.legal_contact_id,
      legalContactFirstName: legalContact?.first_name,
      legalContactLastName: legalContact?.last_name,
      legalContactPhoneNumber: legalContact?.phone_number,
    }))[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}

export async function fetchAdminsPages() {
  noStore();
  try {
    const count = await sql`SELECT COUNT(id) FROM admins`;
    console.log(count);

    return Math.ceil(Number(count.rowCount) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members');
  }
}

export async function fetchFilteredAdmins(query: string, currentPage: number) {
  noStore();

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const admins = await sql<AdminDB>`
      SELECT
        *
      FROM admins
      WHERE
        admins.first_name ILIKE ${`%${query}%`} OR
        admins.last_name ILIKE ${`%${query}%`}
      ORDER BY admins.last_name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return admins.rows.map((admin) => ({
      id: admin.id,
      firstName: admin.first_name,
      lastName: admin.last_name,
      email: admin.email,
      validated: admin.validated,
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch members.');
  }
}

export async function fetchAdminById(id: string) {
  noStore();

  try {
    const { rows } = await sql<AdminDB>`
      SELECT
        *
      FROM admins
      WHERE admins.id = ${id};
    `;

    console.log({ rows });

    return rows.map((admin) => ({
      id: admin.id,
      firstName: admin.first_name,
      lastName: admin.last_name,
      email: admin.email,
      validated: admin.validated,
    }))[0];
  } catch (error) {
    console.error('Database Error:', error);
  }
}
