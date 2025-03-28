import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { PDFDownloadLink, Page, Text, Document, StyleSheet, View } from '@react-pdf/renderer';
import './App.css';
import { pdf } from '@react-pdf/renderer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';




// Define Categories, Products, Pack Sizes, and Units
const categories = {
  Insecticides: {
    "Growprid 700 WDG": { unit: 'gms', packSizes: [ 25, 50, '1kg'] },
    // "Timecarb 340 SC": { unit: 'mls', packSizes: [25, 50, 100,'1ltr'] },
    "Spirometer 500 SC": { unit: 'mls', packSizes: [50, 100, '1ltr'] },
    "Emagurd 57 ME": { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
  },
  Fungicides: {
    "Pyraccop 400 SC": { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    "Azokon 400 SC": { unit: 'mls', packSizes: [50, 100, 250, '1ltr'] },
    // "Manlaxy 680 WG": { unit: 'gms', packSizes: [50, 100, 250, 500, '1kg', '5kgs'] },
  },
  Nutrition: {
    "Okinawo Gold Fruit": { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Seagold: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
    Zincbomate: { unit: 'mls', packSizes: [250, 500, '1ltr'] },
    // Zincamino: { unit: 'mls', packSizes: [250, 500, '1ltr'] },
    Calcibora: { unit: 'mls', packSizes: [250, 500, '1ltr'] },
    Boroking: { unit: 'mls', packSizes: [250, 500, '1ltr'] },
    Growspeed: { unit: 'mls', packSizes: [100, 250, 500, '1ltr'] },
  },
  
  Herbicides: {
    // "Mineposat 500 SL": { unit: 'mls', packSizes: [500, '1ltr','20ltrs'] },
    // Bentagrow: { unit: 'mls', packSizes: [500, '1ltr'] },
    // "Maizeron 300 SE": { unit: 'mls', packSizes: ['1ltr',] },
    "Pendistar 450 CS": { unit: 'mls', packSizes: ['1ltr'] },
    "Broadguard 200 EC": { unit: 'mls', packSizes: ['100mls','500mls', '1ltr'] },
  },
  Adjuvant: {
    Polysil: { unit: 'mls', packSizes: [25, 50, 100, 250, '1ltr'] },
  },
};

// Generate initial sales values dynamically based on categories
const generateInitialSales = () => {
  const sales = {};
  Object.keys(categories).forEach((category) => {
    Object.keys(categories[category]).forEach((product) => {
      const { packSizes } = categories[category][product];
      packSizes.forEach((size) => {
        sales[`sales_${category}_${product}_${size}_quantity`] = '';
        sales[`sales_${category}_${product}_${size}_price`] = '';
      });
    });
  });
  return sales;
};

// Validation Schema using Yup
const ReportSchema = Yup.object().shape({
  date: Yup.string().required('Required'),
  author: Yup.string().required('Author name is required'),
  marketingActivities: Yup.string().required('Marketing Activities are required'),
  competitiveAnalysis: Yup.string().required('Competitive Analysis is required'),
  issues: Yup.string().required('Issues and Challenges are required'),
  upcomingActions: Yup.string().required('Upcoming Actions are required'),
  ...Object.keys(categories).reduce((acc, category) => {
    Object.keys(categories[category]).forEach((product) => {
      categories[category][product].packSizes.forEach((size) => {
        acc[`sales_${category}_${product}_${size}_quantity`] = Yup.number().typeError('Must be a number').nullable();
        acc[`sales_${category}_${product}_${size}_price`] = Yup.number().typeError('Must be a number').nullable();
      });
    });
    return acc;
  }, {}),
});

// PDF component
const ReportPDF = ({ values }) => {
  const salesRows = [];
  const target = parseFloat(values.target) || 0;
  const totalSales = parseFloat(values.totalSales) || 0;
  const percentageAchieved = target > 0 ? ((totalSales / target) * 100).toFixed(2) : 0;

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
            price: parseFloat(values[keyPrice]),
            unit: categories[category][product].unit,
            total: total.toLocaleString('en-US', { style: 'currency', currency: 'Ksh' }),
          });
        }
      });
    });
  });

  return (
    <Document>
      <Page style={styles.body}>
        <image src= '../public/images/logo.jpeg'style={styles.logo} />
        <Text style={styles.header}>Daily Sales Report</Text>
        <Text style={styles.header}>Date: {values.date}</Text>
        <Text style={styles.header}>Staff: {values.author || 'Enter your name'} </Text>
        <Text style={styles.section}>Daily Target: {target ? target.toLocaleString('en-US', { style: 'currency', currency: 'Ksh' }) : 'Enter amount'}</Text>
        <Text style={styles.section}>Percentage Target Achieved: {percentageAchieved}%</Text>
        <Text style={styles.section}>Sales Summary</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeaderCell}>Category</Text>
            <Text style={styles.tableHeaderCell}>Product</Text>
            <Text style={styles.tableHeaderCell}>Pack Size</Text>
            <Text style={styles.tableHeaderCell}>Quantity</Text>
            <Text style={styles.tableHeaderCell}>Price</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
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
        <Text style={styles.section}>Total Sales: {totalSales.toLocaleString('en-US', { style: 'currency', currency: 'Ksh' })}</Text>
        <Text style={styles.section}>Marketing Activities</Text>
<Text style={styles.sectionContent}>{values.marketingActivities}</Text>
<Text style={styles.section}>Competition Analysis</Text>
<Text style={styles.sectionContent}>{values.competitiveAnalysis}</Text>
<Text style={styles.section}>Issues and Challenges</Text>
<Text style={styles.sectionContent}>{values.issues}</Text>
<Text style={styles.section}>Upcoming Actions</Text>
<Text style={styles.sectionContent}>{values.upcomingActions}</Text>

      </Page>
    </Document>
  );
};


const styles = StyleSheet.create({
  body: { padding: 20 },
  header: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  section: { fontSize: 16, marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
  table: { display: 'table', width: 'auto', marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableHeaderCell: { padding: 5, width: '16.66%', fontWeight: 'bold', backgroundColor: '#f0f0f0' },
  tableCell: { padding: 5, width: '16.66%' },
});

const DailyReportApp = () => {
  const [reportData, setReportData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState({});
  // const [author, setAuthor] = useState("");
  const calculateTotalSales = (values) => {
    let total = 0;
    Object.keys(categories).forEach((category) => {
      Object.keys(categories[category]).forEach((product) => {
        categories[category][product].packSizes.forEach((size) => {
          const quantity = parseFloat(values[`sales_${category}_${product}_${size}_quantity`]) || 0;
          const price = parseFloat(values[`sales_${category}_${product}_${size}_price`]) || 0;
          total += quantity * price;
        });
      });
    });
    return total;
  };

  const handleProductSelect = (category, product) => {
    setSelectedProduct({ category, product });
  };

 const handleShare = async (blob, author) => {
  if (!author) {
    alert("Please provide your name before sharing.");
    return;
  }

  if (navigator.share && blob) {
    const formattedDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); // Format: DD-MM-YYYY
    const fileName = `${author}_SalesReport_${formattedDate}.pdf`; // Dynamic filename

    const file = new File([blob], fileName, { type: "application/pdf" });

    try {
      await navigator.share({
        files: [file],
        title: 'Daily Sales Report',
        text: 'Here is the daily sales report.',
      });
    } catch (error) {
      console.error("Error sharing report:", error);
    }
  } else {
    alert("Sharing not supported on this browser.");
  }
};


const sharePDF = async () => {
  if (reportData && reportData.author) { // Check if author name is present
    const pdfBlob = await pdf(<ReportPDF values={reportData} />).toBlob();
    handleShare(pdfBlob, reportData.author);
  } else {
    alert("Please provide your name before sharing.");
  }
};



  return (
    <div className="App">
      <h1>.</h1>
      <Formik
        initialValues={{
          date: '',
          author: '',
          target: '',
          marketingActivities: '',
          competitiveAnalysis: '',
          issues: '',
          upcomingActions: '',
          ...generateInitialSales(),
        }}
        validationSchema={ReportSchema}
        onSubmit={(values) => {
          const totalSales = calculateTotalSales(values);
          setReportData({ ...values, totalSales });
        }}
      >
        {({ values }) => (
          <Form>
            <div>
              <label>Date:</label>
              <Field type="date" name="date" />
              <ErrorMessage name="date" component="div" />
            </div>
            <div>
     <label>Staff Name:</label>
     <Field type="text" name="author" placeholder=" Enter your name.."style={{ fontStyle: 'italic' }} />
     <ErrorMessage name="author" component="div" />
     </div>
            <div>
              <label> Daily Target:</label>
              <Field type="number" name="target"placeholder=" For example 400,000 .."style={{ fontStyle: 'italic' }} />
              <ErrorMessage name="target" component="div" />
            </div>
            <div>
              <h3>Select Product</h3>
              {Object.keys(categories).map((category) => (
                <div key={category}>
                  <h4>{category}</h4>
                  {Object.keys(categories[category]).map((product) => (
                    <div key={product}>
                      <button type="button" onClick={() => handleProductSelect(category, product)}>
                        {product}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {selectedProduct.category && selectedProduct.product && (
              <>
                <h4>Input Sales for {selectedProduct.product}</h4>
                {categories[selectedProduct.category][selectedProduct.product].packSizes.map((size) => (
                  <div key={size}>
                    <label>
                      {size} ({categories[selectedProduct.category][selectedProduct.product].unit})
                    </label>
                    <div>
                      <label>Quantity:</label>
                      <Field
                        type="number"
                        name={`sales_${selectedProduct.category}_${selectedProduct.product}_${size}_quantity`}
                      />
                      <ErrorMessage
                        name={`sales_${selectedProduct.category}_${selectedProduct.product}_${size}_quantity`}
                        component="div"
                      />
                    </div>
                    <div>
                      <label>Price per Unit (Ksh):</label>
                      <Field
                        type="number"
                        name={`sales_${selectedProduct.category}_${selectedProduct.product}_${size}_price`}
                      />
                      <ErrorMessage
                        name={`sales_${selectedProduct.category}_${selectedProduct.product}_${size}_price`}
                        component="div"
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            <div>
              <h3>Other Reports</h3>
              <div>
                <label>Marketing Activities:</label>
                <Field as="textarea" name="marketingActivities" placeholder="List marketing activities engaged in.."style={{ fontStyle: 'italic' }} />
                <ErrorMessage name="marketingActivities" component="div" />
              </div>
              <div>
                <label>Competition Analysis:</label>
                <Field as="textarea" name="competitiveAnalysis" placeholder="List competition activities.."style={{ fontStyle: 'italic' }} />
                <ErrorMessage name="competitiveAnalysis" component="div" />
              </div>
              <div>
                <label>Challenges Faced:</label>
                <Field as="textarea" name="issues"placeholder="Outline challanges faced.."style={{ fontStyle: 'italic' }} />
                <ErrorMessage name="issues" component="div" />
              </div>
              <div>
                <label>Upcoming Actions:</label>
                <Field as="textarea" name="upcomingActions" placeholder="Following day actions/activities.." style={{ fontStyle: 'italic' }}/>
                <ErrorMessage name="upcomingActions" component="div" />
              </div>
            </div>

            <button type="submit">Generate Report</button>
      {reportData && (
        <>
          
          <FontAwesomeIcon
            icon={faShareAlt}
            onClick={() => sharePDF(values)}
            style={{
              cursor: 'pointer',
              fontSize: '28px',
              marginLeft: '10px',
              color: '#4CAF50', 
              transition: 'transform 0.3s ease, color 0.3s ease',
            }}
            title="Share Report"
            onMouseEnter={(e) => (e.currentTarget.style.color = '#2E7D32')} 
            onMouseLeave={(e) => (e.currentTarget.style.color = '#4CAF50')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')} 
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </>
      )}
    </Form>
  )}
</Formik>
    </div>
  );
};

export default DailyReportApp;