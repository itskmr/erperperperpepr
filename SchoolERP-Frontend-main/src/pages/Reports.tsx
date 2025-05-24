import React, { useState } from "react";
import { CSVLink } from "react-csv";

// Define TypeScript interfaces for our data structures
interface DateRange {
  startDate: string;
  endDate: string;
}

interface SortConfig {
  key: string;
  direction: "ascending" | "descending";
}

interface ColumnsToShow {
  id: boolean;
  name: boolean;
  class: boolean;
  paid: boolean;
  due: boolean;
  status: boolean;
  date: boolean;
  mode: boolean;
}

interface ReportData {
  id: number;
  name: string;
  class: string;
  paid: number;
  due: number;
  status: string;
  date: string;
  mode: string;
}

interface ReportSummary {
  totalStudents: number;
  totalPaid: number;
  totalDue: number;
  totalAmount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  partiallyPaidCount: number;
}

interface ExportData {
  headers: string[];
  data: any[][];
}

interface ReportTemplate {
  title: string;
  type: string;
  columns: ColumnsToShow;
  filters: {
    status: string;
    class: string;
    paymentMode: string;
    dateRange: DateRange;
  };
}

const Reports: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterClass, setFilterClass] = useState<string>("All");
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: "",
    endDate: "",
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "id",
    direction: "ascending",
  });
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [reportType, setReportType] = useState<string>("detailed");
  const [reportTitle, setReportTitle] = useState<string>("Fee Collection Report");
  const [showColumnSettings, setShowColumnSettings] = useState<boolean>(false);
  const [columnsToShow, setColumnsToShow] = useState<ColumnsToShow>({
    id: true,
    name: true,
    class: true,
    paid: true,
    due: true,
    status: true,
    date: true,
    mode: true,
  });
  
  // Sample data - this would normally come from an API
  const reportData: ReportData[] = [
    { id: 1, name: "Divya ", class: "5A", paid: 5000, due: 0, status: "Paid", date: "2025-01-31", mode: "Online" },
    { id: 2, name: "Ashish", class: "10B", paid: 3000, due: 2000, status: "Pending", date: "2025-01-15", mode: "Cash" },
    { id: 3, name: "Ronit", class: "10A", paid: 0, due: 5000, status: "Overdue", date: "2025-02-01", mode: "Cheque" },
    { id: 4, name: "Riya", class: "11A", paid: 4500, due: 500, status: "Partially Paid", date: "2025-01-20", mode: "Online" },
    { id: 5, name: "Muskan", class: "11B", paid: 5000, due: 0, status: "Paid", date: "2025-01-10", mode: "Cash" },
    { id: 6, name: "Rahul", class: "12A", paid: 2000, due: 3000, status: "Partially Paid", date: "2025-01-25", mode: "Online" },
    { id: 7, name: "Atul", class: "12B", paid: 0, due: 5000, status: "Overdue", date: "2025-01-05", mode: "Cheque" },
  ];

  // Generate class list from data
  const classList: string[] = ["All", ...new Set(reportData.map(item => item.class))];
  
  // Generate payment mode list from data
  const paymentModeList: string[] = ["All", ...new Set(reportData.map(item => item.mode))];
  
  // Generate status list from data
  const statusList: string[] = ["All", ...new Set(reportData.map(item => item.status))];

  // Filter data based on multiple criteria
  const filteredData: ReportData[] = reportData.filter(
    (row) => {
      const statusMatch = filterStatus === "All" || row.status === filterStatus;
      const classMatch = filterClass === "All" || row.class === filterClass;
      const paymentModeMatch = filterPaymentMode === "All" || row.mode === filterPaymentMode;
      const searchMatch = row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.id.toString().includes(searchTerm) ||
                          row.class.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date range filtering
      let dateMatch = true;
      if (dateRange.startDate && dateRange.endDate) {
        const rowDate = new Date(row.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        dateMatch = rowDate >= startDate && rowDate <= endDate;
      }
      
      return statusMatch && classMatch && paymentModeMatch && searchMatch && dateMatch;
    }
  );

  // Sorting function
  const requestSort = (key: string): void => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting to filtered data
  const sortedData: ReportData[] = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key as keyof ReportData] < b[sortConfig.key as keyof ReportData]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof ReportData] > b[sortConfig.key as keyof ReportData]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Toggle row selection
  const toggleRowSelection = (id: number): void => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Select all rows
  const toggleSelectAll = (): void => {
    if (selectedRows.length === sortedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sortedData.map(row => row.id));
    }
  };

  // Handle column visibility toggle
  const toggleColumn = (column: keyof ColumnsToShow): void => {
    setColumnsToShow(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  // Generate summary data
  const summary: ReportSummary = {
    totalStudents: filteredData.length,
    totalPaid: filteredData.reduce((sum, row) => sum + row.paid, 0),
    totalDue: filteredData.reduce((sum, row) => sum + row.due, 0),
    totalAmount: filteredData.reduce((sum, row) => sum + row.paid + row.due, 0),
    paidCount: filteredData.filter(row => row.status === "Paid").length,
    pendingCount: filteredData.filter(row => row.status === "Pending").length,
    overdueCount: filteredData.filter(row => row.status === "Overdue").length,
    partiallyPaidCount: filteredData.filter(row => row.status === "Partially Paid").length,
  };

  // Prepare CSV export data
  const getExportData = (): ExportData => {
    const headers = [
      { label: "ID", key: "id", show: columnsToShow.id },
      { label: "Student Name", key: "name", show: columnsToShow.name },
      { label: "Class", key: "class", show: columnsToShow.class },
      { label: "Amount Paid", key: "paid", show: columnsToShow.paid },
      { label: "Pending Dues", key: "due", show: columnsToShow.due },
      { label: "Payment Status", key: "status", show: columnsToShow.status },
      { label: "Payment Date", key: "date", show: columnsToShow.date },
      { label: "Payment Mode", key: "mode", show: columnsToShow.mode },
    ].filter(header => header.show);

    const dataToExport = selectedRows.length > 0
      ? sortedData.filter(row => selectedRows.includes(row.id))
      : sortedData;

    return {
      headers: headers.map(h => h.label),
      data: dataToExport.map(row => headers.map(h => row[h.key as keyof ReportData])),
    };
  };

  // Export to PDF function
  const exportToPDF = (): void => {
    const { headers, data } = getExportData();
    const title = `${reportTitle} - ${new Date().toLocaleDateString()}`;
    
    // Would use jsPDF here, but avoiding external libraries as requested
    // This is just a placeholder for the PDF generation functionality
    console.log("PDF Export:", { title, headers, data });
    alert("PDF Export functionality would be implemented here");
  };

  // Print function
  const printReport = (): void => {
    window.print();
  };

  // Email report function
  const emailReport = (): void => {
    alert("Email functionality would be implemented here");
    // Typically would open a dialog to enter email details
  };

  // Save report template
  const saveReportTemplate = (): void => {
    const template: ReportTemplate = {
      title: reportTitle,
      type: reportType,
      columns: columnsToShow,
      filters: {
        status: filterStatus,
        class: filterClass,
        paymentMode: filterPaymentMode,
        dateRange
      }
    };
    
    console.log("Saving template:", template);
    alert("Report template saved successfully");
  };

  return (
    <div className="reports-container" style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>{reportTitle}</h1>

      {/* Report Configuration */}
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Report Title"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            style={{ padding: "8px", width: "300px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
          
          <div>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "4px", marginRight: "10px" }}
            >
              <option value="detailed">Detailed Report</option>
              <option value="summary">Summary Report</option>
              <option value="financial">Financial Report</option>
              <option value="student">Student-wise Report</option>
              <option value="class">Class-wise Report</option>
            </select>
            
            <button 
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              style={{ padding: "8px 12px", backgroundColor: "#4a4a4a", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Column Settings
            </button>
          </div>
        </div>
        
        {/* Column Settings Panel */}
        {showColumnSettings && (
          <div style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", backgroundColor: "#fff" }}>
            <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>Column Visibility</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={columnsToShow.id} 
                  onChange={() => toggleColumn("id")}
                  style={{ marginRight: "5px" }}
                />
                ID
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={columnsToShow.name} 
                  onChange={() => toggleColumn("name")}
                  style={{ marginRight: "5px" }}
                />
                Student Name
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={columnsToShow.class} 
                  onChange={() => toggleColumn("class")}
                  style={{ marginRight: "5px" }}
                />
                Class
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={columnsToShow.paid} 
                  onChange={() => toggleColumn("paid")}
                  style={{ marginRight: "5px" }}
                />
                Amount Paid
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={columnsToShow.due} 
                  onChange={() => toggleColumn("due")}
                  style={{ marginRight: "5px" }}
                />
                Pending Dues
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={columnsToShow.status} 
                  onChange={() => toggleColumn("status")}
                  style={{ marginRight: "5px" }}
                />
                Payment Status
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={columnsToShow.date} 
                  onChange={() => toggleColumn("date")}
                  style={{ marginRight: "5px" }}
                />
                Payment Date
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" 
                  checked={columnsToShow.mode} 
                  onChange={() => toggleColumn("mode")}
                  style={{ marginRight: "5px" }}
                />
                Payment Mode
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
        <h3 style={{ marginBottom: "10px", fontSize: "16px" }}>Filter Options</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
          <div>
            <input
              type="text"
              placeholder="Search by Name, ID, or Class"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              {statusList.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              {classList.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={filterPaymentMode}
              onChange={(e) => setFilterPaymentMode(e.target.value)}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              {paymentModeList.map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>
          
          <div>
            <input
              type="date"
              placeholder="Start Date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          
          <div>
            <input
              type="date"
              placeholder="End Date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards - Only shown for summary report type */}
      {reportType === "summary" && (
        <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#fff" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>Total Students</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{summary.totalStudents}</p>
          </div>
          
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#fff" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>Total Collected</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>₹{summary.totalPaid.toLocaleString()}</p>
          </div>
          
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#fff" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>Total Due</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>₹{summary.totalDue.toLocaleString()}</p>
          </div>
          
          <div style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#fff" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "5px" }}>Payment Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Paid:</span>
                <span>{summary.paidCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Pending:</span>
                <span>{summary.pendingCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Overdue:</span>
                <span>{summary.overdueCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Partially Paid:</span>
                <span>{summary.partiallyPaidCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Operations */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <span style={{ marginRight: "10px" }}>
            <strong>{sortedData.length}</strong> records found
          </span>
          <span>
            <strong>{selectedRows.length}</strong> records selected
          </span>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <CSVLink
            data={getExportData().data}
            headers={getExportData().headers.map(header => ({ label: header, key: header.toLowerCase().replace(' ', '_') }))}
            filename={`${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`}
            className="csv-link"
            style={{ textDecoration: "none" }}
          >
            <button style={{ padding: "8px 12px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Export CSV
            </button>
          </CSVLink>
          
          <button 
            onClick={exportToPDF}
            style={{ padding: "8px 12px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Export PDF
          </button>
          
          <button 
            onClick={printReport}
            style={{ padding: "8px 12px", backgroundColor: "#607D8B", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Print
          </button>
          
          <button 
            onClick={emailReport}
            style={{ padding: "8px 12px", backgroundColor: "#FF9800", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Email
          </button>
          
          <button 
            onClick={saveReportTemplate}
            style={{ padding: "8px 12px", backgroundColor: "#9C27B0", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Save Template
          </button>
        </div>
      </div>

      {/* Table View */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "left" }}>
                <input 
                  type="checkbox" 
                  checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              
              {columnsToShow.id && (
                <th 
                  style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "left", cursor: "pointer" }}
                  onClick={() => requestSort("id")}
                >
                  ID {sortConfig.key === "id" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                </th>
              )}
              
              {columnsToShow.name && (
                <th 
                  style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "left", cursor: "pointer" }}
                  onClick={() => requestSort("name")}
                >
                  Student Name {sortConfig.key === "name" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                </th>
              )}
              
              {columnsToShow.class && (
                <th 
                  style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "left", cursor: "pointer" }}
                  onClick={() => requestSort("class")}
                >
                  Class {sortConfig.key === "class" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                </th>
              )}
              
              {columnsToShow.paid && (
                <th 
                  style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "right", cursor: "pointer" }}
                  onClick={() => requestSort("paid")}
                >
                  Amount Paid {sortConfig.key === "paid" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                </th>
              )}
              
              {columnsToShow.due && (
                <th 
                  style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "right", cursor: "pointer" }}
                  onClick={() => requestSort("due")}
                >
                  Pending Dues {sortConfig.key === "due" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                </th>
              )}
              
              {columnsToShow.status && (
                <th 
                  style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "left", cursor: "pointer" }}
                  onClick={() => requestSort("status")}
                >
                  Payment Status {sortConfig.key === "status" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                </th>
              )}
              
              {columnsToShow.date && (
                <th 
                  style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "left", cursor: "pointer" }}
                  onClick={() => requestSort("date")}
                >
                  Payment Date {sortConfig.key === "date" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                </th>
              )}
              
              {columnsToShow.mode && (
                <th 
                  style={{ padding: "12px 8px", borderBottom: "2px solid #ddd", textAlign: "left", cursor: "pointer" }}
                  onClick={() => requestSort("mode")}
                >
                  Payment Mode {sortConfig.key === "mode" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                </th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {sortedData.map((row) => (
              <tr 
                key={row.id}
                style={{ 
                  backgroundColor: selectedRows.includes(row.id) ? "#e3f2fd" : "transparent",
                  borderBottom: "1px solid #ddd"
                }}
              >
                <td style={{ padding: "8px" }}>
                  <input 
                    type="checkbox" 
                    checked={selectedRows.includes(row.id)}
                    onChange={() => toggleRowSelection(row.id)}
                  />
                </td>
                
                {columnsToShow.id && <td style={{ padding: "8px" }}>{row.id}</td>}
                {columnsToShow.name && <td style={{ padding: "8px" }}>{row.name}</td>}
                {columnsToShow.class && <td style={{ padding: "8px" }}>{row.class}</td>}
                {columnsToShow.paid && <td style={{ padding: "8px", textAlign: "right" }}>₹{row.paid}</td>}
                {columnsToShow.due && <td style={{ padding: "8px", textAlign: "right" }}>₹{row.due}</td>}
                {columnsToShow.status && (
                  <td style={{ padding: "8px" }}>
                    <span style={{ 
                      display: "inline-block",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      backgroundColor: 
                        row.status === "Paid" ? "#e8f5e9" : 
                        row.status === "Pending" ? "#fff8e1" : 
                        row.status === "Overdue" ? "#ffebee" : 
                        row.status === "Partially Paid" ? "#e3f2fd" : "#f5f5f5",
                      color: 
                        row.status === "Paid" ? "#2e7d32" : 
                        row.status === "Pending" ? "#f57f17" : 
                        row.status === "Overdue" ? "#c62828" : 
                        row.status === "Partially Paid" ? "#1565c0" : "#333"
                    }}>
                      {row.status}
                    </span>
                  </td>
                )}
                {columnsToShow.date && <td style={{ padding: "8px" }}>{row.date}</td>}
                {columnsToShow.mode && <td style={{ padding: "8px" }}>{row.mode}</td>}
              </tr>
            ))}
            
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "20px", textAlign: "center" }}>
                  No records found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
          
          {/* Table Footer with Totals */}
          <tfoot style={{ backgroundColor: "#f9f9f9", fontWeight: "bold" }}>
            <tr>
              <td style={{ padding: "12px 8px", borderTop: "2px solid #ddd" }}></td>
              
              {columnsToShow.class && <td style={{ padding: "12px 8px", borderTop: "2px solid #ddd" }}></td>}
              {columnsToShow.paid && <td style={{ padding: "12px 8px", borderTop: "2px solid #ddd", textAlign: "right" }}>₹{summary.totalPaid.toLocaleString()}</td>}
              {columnsToShow.due && <td style={{ padding: "12px 8px", borderTop: "2px solid #ddd", textAlign: "right" }}>₹{summary.totalDue.toLocaleString()}</td>}
              {columnsToShow.status && <td style={{ padding: "12px 8px", borderTop: "2px solid #ddd" }}></td>}
              {columnsToShow.date && <td style={{ padding: "12px 8px", borderTop: "2px solid #ddd" }}></td>}
              {columnsToShow.mode && <td style={{ padding: "12px 8px", borderTop: "2px solid #ddd" }}></td>}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination (simplified version) */}
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            style={{ 
              padding: "8px 16px", 
              border: "1px solid #ddd", 
              backgroundColor: "#f9f9f9", 
              cursor: "pointer",
              borderRadius: "4px" 
            }}
          >
            Previous
          </button>
          <button 
            style={{ 
              padding: "8px 16px", 
              border: "1px solid #ddd", 
              backgroundColor: "#2196F3", 
              color: "white", 
              cursor: "pointer",
              borderRadius: "4px" 
            }}
          >
            1
          </button>
          <button 
            style={{ 
              padding: "8px 16px", 
              border: "1px solid #ddd", 
              backgroundColor: "#f9f9f9", 
              cursor: "pointer",
              borderRadius: "4px" 
            }}
          >
            2
          </button>
          <button 
            style={{ 
              padding: "8px 16px", 
              border: "1px solid #ddd", 
              backgroundColor: "#f9f9f9", 
              cursor: "pointer",
              borderRadius: "4px" 
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;