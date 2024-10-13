import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { PDFDownloadLink, Page, Text, Document, StyleSheet } from '@react-pdf/renderer';
import './App.css';

// Define Categories, Products, Pack Sizes, and Units
const categories = {
  Insecticides: {
    Growpride: { unit: 'gms', packSizes: [5, 10, 25, 50, 100, '1kg'] },
    Timecarb: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
    Spirometer: { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    Emargurd: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
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
        const key = `sales_${category}_${product}_${size}`;
        sales[key] = '';
      });
    });
  });
  return sales;
};

// Validation Schema using Yup
const ReportSchema = Yup.object().shape({
  date: Yup.string().required('Required'),
  author: Yup.string().required('Required'),
  totalSales: Yup.number()
    .typeError('Must be a number')
    .required('Total Sales is required'),
  marketingActivities: Yup.string().required('Marketing Activities are required'),
  competitiveAnalysis: Yup.string().required('Competitive Analysis is required'),
  issues: Yup.string().required('Issues and Challenges are required'),
  upcomingActions: Yup.string().required('Upcoming Actions are required'),
  // Dynamically add validations for each product's pack size sales
  ...Object.keys(categories).reduce((acc, category) => {
    Object.keys(categories[category]).forEach((product) => {
      categories[category][product].packSizes.forEach((size) => {
        const key = `sales_${category}_${product}_${size}`;
        acc[key] = Yup.number()
          .typeError('Must be a number')
          .required(`Sales for ${product} (${size} ${categories[category][product].unit}) is required`);
      });
    });
    return acc;
  }, {}),
});

// PDF component
const ReportPDF = ({ values }) => (
  <Document>
    <Page style={styles.body}>
      <Text style={styles.header}>Date: {values.date}</Text>
      <Text style={styles.header}>Report Author: {values.author}</Text>

      <Text style={styles.section}>Sales Summary</Text>
      <Text>Total Sales: {values.totalSales}</Text>

      {/* Detailed Sales per Product per Pack Size */}
      <Text style={styles.section}>Detailed Sales per Product</Text>
      {Object.keys(categories).map((category) => (
        <React.Fragment key={category}>
          <Text style={styles.subSection}>{category}</Text>
          {Object.keys(categories[category]).map((product) => (
            <React.Fragment key={product}>
              <Text style={styles.productTitle}>{product} ({categories[category][product].unit})</Text>
              {categories[category][product].packSizes.map((size) => {
                const key = `sales_${category}_${product}_${size}`;
                return (
                  <Text key={key} style={styles.packSizeText}>
                    {size}: {values[key]}
                  </Text>
                );
              })}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}

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

// PDF Styles
const styles = StyleSheet.create({
  body: { padding: 10 },
  header: { fontSize: 18, marginBottom: 10 },
  section: { fontSize: 16, marginTop: 10, marginBottom: 5 },
  subSection: { fontSize: 14, marginTop: 5, marginBottom: 3, marginLeft: 10 },
  productTitle: { fontSize: 13, marginTop: 3, marginBottom: 2, marginLeft: 20 },
  packSizeText: { fontSize: 12, marginLeft: 30, marginBottom: 1 },
});

const DailyReportApp = () => {
  const [reportData, setReportData] = useState(null);

  // Function to calculate total sales
  const calculateTotalSales = (values) => {
    let total = 0;
    Object.keys(categories).forEach((category) => {
      Object.keys(categories[category]).forEach((product) => {
        categories[category][product].packSizes.forEach((size) => {
          const key = `sales_${category}_${product}_${size}`;
          const value = parseFloat(values[key]) || 0; // Use 0 if NaN
          total += value;
        });
      });
    });
    return total;
  };

  return (
    <div className="container">
      <h1>Growmate Daily Report</h1>
      <Formik
        initialValues={{
          date: '',
          author: '',
          totalSales: '',
          marketingActivities: '',
          competitiveAnalysis: '',
          issues: '',
          upcomingActions: '',
          ...generateInitialSales(),
        }}
        validationSchema={ReportSchema}
        onSubmit={(values) => {
          const calculatedTotalSales = calculateTotalSales(values);
          setReportData({ ...values, totalSales: calculatedTotalSales });
        }}
      >
        {({ isSubmitting, values, setFieldValue }) => {
          const handleSalesChange = (category, product, size, value) => {
            const key = `sales_${category}_${product}_${size}`;
            setFieldValue(key, value);
            const newValues = { ...values, [key]: value }; // Create a new values object
            const total = calculateTotalSales(newValues);
            setFieldValue('totalSales', total); // Update total sales
          };

          return (
            <Form>
              {/* Existing Form Fields */}
              <div>
                <label>Date</label>
                <Field name="date" type="date" />
                <ErrorMessage name="date" component="div" className="error" />
              </div>

              <div>
                <label>Staff Name</label>
                <Field name="author" type="text" />
                <ErrorMessage name="author" component="div" className="error" />
              </div>

              <div>
                <label>Total Sales</label>
                <Field name="totalSales" type="number" readOnly />
                <ErrorMessage name="totalSales" component="div" className="error" />
              </div>

              {/* New Dynamic Sales Fields */}
              <div>
                {Object.keys(categories).map((category) => (
                  <div key={category}>
                    <h3>{category}</h3>
                    {Object.keys(categories[category]).map((product) => (
                      <div key={product}>
                        <h4>{product}</h4>
                        {categories[category][product].packSizes.map((size) => (
                          <div key={size}>
                            <label>
                              {size} ({categories[category][product].unit})
                            </label>
                            <Field
                              name={`sales_${category}_${product}_${size}`}
                              type="number"
                              onChange={(e) => handleSalesChange(category, product, size, e.target.value)}
                            />
                            <ErrorMessage name={`sales_${category}_${product}_${size}`} component="div" className="error" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div>
                <label>Marketing Activities</label>
                <Field as="textarea" name="marketingActivities" />
                <ErrorMessage name="marketingActivities" component="div" className="error" />
              </div>

              <div>
                <label>Competitive Analysis</label>
                <Field as="textarea" name="competitiveAnalysis" />
                <ErrorMessage name="competitiveAnalysis" component="div" className="error" />
              </div>

              <div>
                <label>Issues and Challenges</label>
                <Field as="textarea" name="issues" />
                <ErrorMessage name="issues" component="div" className="error" />
              </div>

              <div>
                <label>Upcoming Actions</label>
                <Field as="textarea" name="upcomingActions" />
                <ErrorMessage name="upcomingActions" component="div" className="error" />
              </div>

              <button type="submit" disabled={isSubmitting}>
                Submit
              </button>

              {reportData && (
                <PDFDownloadLink document={<ReportPDF values={reportData} />} fileName="daily-report.pdf">
                  {({ loading }) => (loading ? 'Loading document...' : 'Download Report')}
                </PDFDownloadLink>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default DailyReportApp;
