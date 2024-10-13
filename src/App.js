import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { PDFDownloadLink, Page, Text, Document, StyleSheet, View } from '@react-pdf/renderer';
import './App.css';

// Define Categories, Products, Pack Sizes, and Units
const categories = {
  Insecticides: {
    Growprid: { unit: 'gms', packSizes: [5, 10, 25, 50, 100, '1kg'] },
    Timecarb: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
    Spirometer: { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    Emagurd: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
  },
  Fungicides: {
    Pyraccop: { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    Azokon: { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    Manlaxy: { unit: 'gms', packSizes: [50, 100, 250, 500, '1kg'] },
  },
  Nutrition: {
    Okinawo: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Seagold: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Zincbomate: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Calcibora: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Boroking: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Growspeed_macro: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
  },
  Adjuvant: {
    Polysil: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
  },
  Herbicides: {
    MIne_posat: { unit: 'mls', packSizes: [500, '1ltr'] },
    Bentagrow: { unit: 'mls', packSizes: [500, '1ltr'] },
  },
};

// Function to generate initial sales values dynamically based on categories
const generateInitialSales = () => {
  const sales = {};
  Object.keys(categories).forEach((category) => {
    Object.keys(categories[category]).forEach((product) => {
      const { packSizes } = categories[category][product];
      packSizes.forEach((size) => {
        const keyQuantity = `sales_${category}_${product}_${size}_quantity`;
        const keyPrice = `sales_${category}_${product}_${size}_price`;
        sales[keyQuantity] = ''; // Set initial value for quantity to an empty string
        sales[keyPrice] = ''; // Set initial value for price to an empty string
      });
    });
  });
  return sales;
};

// Validation Schema using Yup
const ReportSchema = Yup.object().shape({
  date: Yup.string().required('Required'),
  author: Yup.string().required('Required'),
  marketingActivities: Yup.string().required('Marketing Activities are required'),
  competitiveAnalysis: Yup.string().required('Competitive Analysis is required'),
  issues: Yup.string().required('Issues and Challenges are required'),
  upcomingActions: Yup.string().required('Upcoming Actions are required'),
  ...Object.keys(categories).reduce((acc, category) => {
    Object.keys(categories[category]).forEach((product) => {
      categories[category][product].packSizes.forEach((size) => {
        const keyQuantity = `sales_${category}_${product}_${size}_quantity`;
        const keyPrice = `sales_${category}_${product}_${size}_price`;
        acc[keyQuantity] = Yup.number()
          .typeError('Must be a number')
          .nullable();
        acc[keyPrice] = Yup.number()
          .typeError('Must be a number')
          .nullable();
      });
    });
    return acc;
  }, {}),
});

// Helper function to format numbers as currency
// Helper function to format numbers as currency for total sales
const formatCurrency = (value) => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'Ksh' });
};



// PDF component
const ReportPDF = ({ values }) => {
  const salesRows = [];
  Object.keys(categories).forEach((category) => {
    Object.keys(categories[category]).forEach((product) => {
      categories[category][product].packSizes.forEach((size) => {
        const keyQuantity = `sales_${category}_${product}_${size}_quantity`;
        const keyPrice = `sales_${category}_${product}_${size}_price`;
        if (values[keyQuantity]) {
          const total = (parseFloat(values[keyQuantity]) || 0) * (parseFloat(values[keyPrice]) || 0);
          salesRows.push({
            category,
            product,
            size,
            quantity: values[keyQuantity],
            price: parseFloat(values[keyPrice]), // Use raw number for price without formatting
            unit: categories[category][product].unit,
            total: formatCurrency(total), // Format total as currency
          });
          
        }
      });
    });
  });

  return (
    <Document>
      <Page style={styles.body}>
        <Text style={styles.header}>Daily Sales Report</Text>
        <Text style={styles.header}>Date: {values.date}</Text>
        <Text style={styles.header}>Staff: {values.author}</Text>

        <Text style={styles.section}>Sales Summary</Text>
        <Text>Total Sales:{formatCurrency(values.totalSales)}</Text> {/* Format total sales as currency */}

        <Text style={styles.section}>Detailed Sales per Product</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.headerCell]}>Category</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Product</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Size</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Quantity</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Price</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Total</Text>
          </View>
          {salesRows.map((row, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{row.category}</Text>
              <Text style={styles.tableCell}>{row.product}</Text>
              <Text style={styles.tableCell}>{row.size} ({row.unit})</Text>
              <Text style={styles.tableCell}>{row.quantity}</Text>
              <Text style={styles.tableCell}>{row.price}</Text>
              <Text style={styles.tableCell}>{row.total}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Marketing Activities</Text>
        <Text>{values.marketingActivities}</Text>
        <Text style={styles.section}>Competitive Analysis</Text>
        <Text>{values.competitiveAnalysis}</Text>
        <Text style={styles.section}>Issues and Challenges</Text>
        <Text>{values.issues}</Text>
        <Text style={styles.section}>Upcoming Actions</Text>
        <Text>{values.upcomingActions}</Text>
      </Page>
    </Document>
  );
};

// PDF Styles
const styles = StyleSheet.create({
  body: { padding: 10 },
  header: { fontSize: 18, marginBottom: 10 },
  section: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  table: { display: 'table', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableCell: { padding: 5, width: '16.66%' }, // Adjusted width for the new columns
  headerCell: { fontWeight: 'bold', backgroundColor: '#f2f2f2' },
});

const DailyReportApp = () => {
  const [reportData, setReportData] = useState(null);

  // Function to calculate total sales only for non-empty fields
  const calculateTotalSales = (values) => {
    let total = 0;
    Object.keys(categories).forEach((category) => {
      Object.keys(categories[category]).forEach((product) => {
        categories[category][product].packSizes.forEach((size) => {
          const keyQuantity = `sales_${category}_${product}_${size}_quantity`;
          const keyPrice = `sales_${category}_${product}_${size}_price`;
          const quantity = parseFloat(values[keyQuantity]) || 0;
          const price = parseFloat(values[keyPrice]) || 0;
          total += quantity * price;
        });
      });
    });
    return total;
  };

  return (
    <div className="App">
      <h1>Daily Sales Report</h1>
      <Formik
        initialValues={{
          date: '',
          author: '',
          marketingActivities: '',
          competitiveAnalysis: '',
          issues: '',
          upcomingActions: '',
          ...generateInitialSales(),
        }}
        validationSchema={ReportSchema}
        onSubmit={(values) => {
          values.totalSales = calculateTotalSales(values); // Calculate and store total sales
          setReportData(values); // Set the report data to generate PDF
        }}
      >
        {({ values }) => (
          <Form>
            <div>
              <label htmlFor="date">Date:</label>
              <Field type="date" id="date" name="date" />
              <ErrorMessage name="date" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="author">Staff Name:</label>
              <Field type="text" id="author" name="author" />
              <ErrorMessage name="author" component="div" className="error" />
            </div>
            
            {/* Render dynamic fields for sales data */}
            {Object.keys(categories).map((category) => (
              <div key={category}>
                <h2>{category}</h2>
                {Object.keys(categories[category]).map((product) => (
                  <div key={product}>
                    <h3>{product}</h3>
                    {categories[category][product].packSizes.map((size) => (
                      <div key={size}>
                        <label>
                          {size} ({categories[category][product].unit}) Quantity:
                          <Field
                            type="number"
                            name={`sales_${category}_${product}_${size}_quantity`}
                            // placeholder={`Enter quantity for ${size}`}
                          />
                          Price:
                          <Field
                            type="number"
                            name={`sales_${category}_${product}_${size}_price`}
                            // placeholder={`Enter price for ${size}`}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Additional sections for report */}
            <div>
              <label htmlFor="marketingActivities">Marketing Activities:</label>
              <Field as="textarea" id="marketingActivities" name="marketingActivities" />
              <ErrorMessage name="marketingActivities" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="competitiveAnalysis">Competitive Analysis:</label>
              <Field as="textarea" id="competitiveAnalysis" name="competitiveAnalysis" />
              <ErrorMessage name="competitiveAnalysis" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="issues">Issues and Challenges:</label>
              <Field as="textarea" id="issues" name="issues" />
              <ErrorMessage name="issues" component="div" className="error" />
            </div>
            <div>
              <label htmlFor="upcomingActions">Upcoming Actions:</label>
              <Field as="textarea" id="upcomingActions" name="upcomingActions" />
              <ErrorMessage name="upcomingActions" component="div" className="error" />
            </div>

            <button type="submit">Generate Report</button>
          </Form>
        )}
      </Formik>

      {/* Render the PDF Download Link if report data is available */}
      {reportData && (
        <PDFDownloadLink
          document={<ReportPDF values={reportData} />}
          fileName="daily_sales_report.pdf"
        >
          {({ loading }) => (loading ? 'Generating PDF...' : 'Download Report as PDF')}
        </PDFDownloadLink>
      )}
    </div>
  );
};

export default DailyReportApp;
