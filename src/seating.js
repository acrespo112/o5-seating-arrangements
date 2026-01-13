import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Users, Building, ChevronDown, X, MapPin, Edit2, Save } from 'lucide-react';
import four from "C:\\Users\\acrespo\\Downloads\\seating-o5\\src\\imgs\\4th Floor NEW.pdf";
import five from "C:\\Users\\acrespo\\Downloads\\seating-o5\\src\\imgs\\5th Floor Seating Numbers V2.pdf";
import six from "C:\\Users\\acrespo\\Downloads\\seating-o5\\src\\imgs\\6th Floorplan Desks.pdf";
import nine from "C:\\Users\\acrespo\\Downloads\\seating-o5\\src\\imgs\\9th floor Layout.pdf";


// PDF Viewer Component using pdf.js
const PDFFloorplanViewer = ({ pdfUrl, children }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadPDF = async () => {
      try {
        setLoading(true);
        setPdfError(false);
        
        // Wait for pdf.js to load
        const checkPdfJs = () => {
          return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const check = () => {
              if (window['pdfjs-dist/build/pdf']) {
                resolve(window['pdfjs-dist/build/pdf']);
              } else if (attempts >= maxAttempts) {
                reject(new Error('PDF.js failed to load'));
              } else {
                attempts++;
                setTimeout(check, 100);
              }
            };
            check();
          });
        };

        // Load PDF.js script if not already loaded
        if (!window['pdfjs-dist/build/pdf']) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.async = true;
          document.head.appendChild(script);
        }

        const pdfjsLib = await checkPdfJs();
        
        if (!mounted) return;

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        if (!mounted) return;

        const page = await pdf.getPage(1);

        const canvas = canvasRef.current;
        if (!canvas || !mounted) return;

        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        await page.render(renderContext).promise;
        
        if (mounted) {
          setPdfLoaded(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (mounted) {
          setPdfError(true);
          setLoading(false);
        }
      }
    };

    loadPDF();

    return () => {
      mounted = false;
    };
  }, [pdfUrl]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {!pdfError ? (
        <>
          <canvas 
            ref={canvasRef} 
            style={{
              width: '100%',
              height: 'auto',
              display: pdfLoaded ? 'block' : 'none',
              borderRadius: '8px',
              background: '#fff'
            }}
          />
          {loading && (
            <div style={{
              width: '100%',
              minHeight: '800px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.95)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '1.1rem',
              gap: '1rem'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(59, 130, 246, 0.3)',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              Loading PDF floorplan...
            </div>
          )}
        </>
      ) : (
        <div style={{
          width: '100%',
          minHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.3), rgba(51, 65, 85, 0.3))',
          border: '2px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '8px',
          padding: '3rem'
        }}>
          <MapPin size={64} style={{ color: '#64748b', marginBottom: '1rem', opacity: 0.5 }} />
          <div style={{
            color: '#94a3b8',
            fontSize: '1.1rem',
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            PDF Floorplan Unavailable
          </div>
          <div style={{
            color: '#64748b',
            fontSize: '0.9rem',
            textAlign: 'center',
            maxWidth: '500px',
            lineHeight: '1.5'
          }}>
            The PDF couldn't be loaded. This may be due to browser restrictions or file access permissions.
            Employee assignments are still shown as cards below. Try using the other view modes for full functionality.
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

// Floor data extracted from the PDFs - now with simple chronological numbering
const DEFAULT_FLOOR_DATA = {
  4: {
    name: '4th Floor',
    pdfUrl: four,
    desks: Array.from({ length: 84 }, (_, i) => `4-${String(i + 1).padStart(3, '0')}`) // 4-001 to 4-084
  },
  5: {
    name: '5th Floor',
    pdfUrl: five,
    desks: Array.from({ length: 127 }, (_, i) => `5-${String(i + 1).padStart(3, '0')}`) // 5-001 to 5-127
  },
  6: {
    name: '6th Floor',
    pdfUrl: six,
    desks: Array.from({ length: 43 }, (_, i) => `6-${String(i + 1).padStart(3, '0')}`) // 6-001 to 6-043
  },
  9: {
    name: '9th Floor',
    pdfUrl: nine,
    desks: Array.from({ length: 63 }, (_, i) => `9-${String(i + 1).padStart(3, '0')}`) // 9-001 to 9-063
  }
};

const SeatingApp = () => {
  // Load assignments from localStorage on initial render
  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('seatingAssignments');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading assignments:', error);
      return {};
    }
  });
  
  // Load desk positions from localStorage
  const [deskPositions, setDeskPositions] = useState(() => {
    try {
      const saved = localStorage.getItem('deskPositions');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading positions:', error);
      return {};
    }
  });

  // Load custom floor data (for desk names and additions)
  const [floorData, setFloorData] = useState(() => {
    try {
      const saved = localStorage.getItem('floorData');
      return saved ? JSON.parse(saved) : DEFAULT_FLOOR_DATA;
    } catch (error) {
      console.error('Error loading floor data:', error);
      return DEFAULT_FLOOR_DATA;
    }
  });
  
  const [selectedFloor, setSelectedFloor] = useState(4);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDesk, setEditingDesk] = useState(null);
  const [tempName, setTempName] = useState('');
  const [viewMode, setViewMode] = useState('floor'); // 'floor', 'list', 'map', 'floorplan', or 'pdf'
  const [draggingDesk, setDraggingDesk] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1); // Zoom level for PDF view
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Pan offset for PDF view
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDeskManagement, setShowDeskManagement] = useState(false);
  const [renamingDesk, setRenamingDesk] = useState(null);
  const [newDeskName, setNewDeskName] = useState('');

  // Save assignments to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('seatingAssignments', JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving assignments:', error);
    }
  }, [assignments]);

  // Save desk positions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('deskPositions', JSON.stringify(deskPositions));
    } catch (error) {
      console.error('Error saving positions:', error);
    }
  }, [deskPositions]);

  // Save floor data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('floorData', JSON.stringify(floorData));
    } catch (error) {
      console.error('Error saving floor data:', error);
    }
  }, [floorData]);

  // Get all employees sorted alphabetically
  const allEmployees = useMemo(() => {
    const employees = [];
    Object.entries(assignments).forEach(([desk, name]) => {
      if (name) {
        const floor = Object.entries(floorData).find(([_, data]) => 
          data.desks.includes(desk)
        )?.[0];
        employees.push({ name, desk, floor: parseInt(floor) });
      }
    });
    return employees.sort((a, b) => a.name.localeCompare(b.name));
  }, [assignments, floorData]);

  // Filter employees by search
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return allEmployees;
    return allEmployees.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.desk.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allEmployees, searchTerm]);

  // Group employees by floor
  const employeesByFloor = useMemo(() => {
    const grouped = {};
    allEmployees.forEach(emp => {
      if (!grouped[emp.floor]) grouped[emp.floor] = [];
      grouped[emp.floor].push(emp);
    });
    return grouped;
  }, [allEmployees]);

  const handleAssignDesk = (desk, name) => {
    setAssignments(prev => ({ ...prev, [desk]: name }));
    setEditingDesk(null);
    setTempName('');
  };

  const handleRemoveAssignment = (desk) => {
    setAssignments(prev => {
      const updated = { ...prev };
      delete updated[desk];
      return updated;
    });
  };

  const startEditing = (desk) => {
    setEditingDesk(desk);
    setTempName(assignments[desk] || '');
  };

  // Drag and drop handlers for PDF overlay
  const handleDragStart = (e, desk) => {
    e.stopPropagation(); // Prevent pan from starting
    setDraggingDesk(desk);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.currentTarget.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrag = (e, desk) => {
    if (!draggingDesk || e.clientX === 0 || e.clientY === 0) return;
    e.stopPropagation();
  };

  const handleDragEnd = (e, desk) => {
    e.stopPropagation();
    if (!draggingDesk) return;
    
    const parent = e.currentTarget.offsetParent;
    if (!parent) {
      setDraggingDesk(null);
      e.currentTarget.style.opacity = '1';
      return;
    }
    
    const parentRect = parent.getBoundingClientRect();
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Account for zoom level when calculating position
    const x = ((rect.left - parentRect.left) / parentRect.width) * 100;
    const y = ((rect.top - parentRect.top) / parentRect.height) * 100;
    
    // Clamp to bounds
    const clampedX = Math.max(0, Math.min(95, x));
    const clampedY = Math.max(0, Math.min(95, y));
    
    // Save position for this desk on this floor
    setDeskPositions(prev => ({
      ...prev,
      [selectedFloor]: {
        ...(prev[selectedFloor] || {}),
        [desk]: { left: clampedX, top: clampedY }
      }
    }));
    
    e.currentTarget.style.opacity = '1';
    setDraggingDesk(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
    e.stopPropagation();
    if (draggingDesk) {
      const parent = e.currentTarget;
      const parentRect = parent.getBoundingClientRect();
      
      // Find the dragging element
      const draggingElement = document.querySelector(`[data-desk="${draggingDesk}"]`);
      if (draggingElement) {
        const x = ((e.clientX - parentRect.left - dragOffset.x) / parentRect.width) * 100;
        const y = ((e.clientY - parentRect.top - dragOffset.y) / parentRect.height) * 100;
        
        const clampedX = Math.max(0, Math.min(95, x));
        const clampedY = Math.max(0, Math.min(95, y));
        
        draggingElement.style.left = `${clampedX}%`;
        draggingElement.style.top = `${clampedY}%`;
      }
    }
  };

  const getDeskPosition = (desk, index) => {
    // Check if we have a saved position for this desk on this floor
    if (deskPositions[selectedFloor] && deskPositions[selectedFloor][desk]) {
      return deskPositions[selectedFloor][desk];
    }
    
    // Default grid positioning
    const col = index % 12;
    const row = Math.floor(index / 12);
    return {
      left: 5 + (col * 7.5),
      top: 10 + (row * 8)
    };
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Pan controls
  const handlePanStart = (e) => {
    // Don't pan if we're dragging a card or clicking on a card
    if (e.button !== 0 || draggingDesk || e.target.closest('[data-desk]')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handlePanMove = (e) => {
    if (!isPanning || draggingDesk) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Export/Import handlers
  const handleExportData = () => {
    const data = {
      assignments,
      deskPositions,
      floorData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seating-assignments-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.assignments) {
          setAssignments(data.assignments);
          localStorage.setItem('seatingAssignments', JSON.stringify(data.assignments));
        }
        
        if (data.deskPositions) {
          setDeskPositions(data.deskPositions);
          localStorage.setItem('deskPositions', JSON.stringify(data.deskPositions));
        }

        if (data.floorData) {
          setFloorData(data.floorData);
          localStorage.setItem('floorData', JSON.stringify(data.floorData));
        }
        
        alert('Data imported successfully!');
        setShowExportMenu(false);
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing data. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL seating assignments and positions? This cannot be undone!')) {
      setAssignments({});
      setDeskPositions({});
      setFloorData(DEFAULT_FLOOR_DATA);
      localStorage.removeItem('seatingAssignments');
      localStorage.removeItem('deskPositions');
      localStorage.removeItem('floorData');
      alert('All data has been cleared.');
      setShowExportMenu(false);
    }
  };

  // Desk management handlers
  const handleAddDesk = () => {
    const floor = selectedFloor;
    const currentDesks = floorData[floor].desks;
    const nextNumber = currentDesks.length + 1;
    const newDeskId = `${floor}-${String(nextNumber).padStart(3, '0')}`;
    
    setFloorData(prev => ({
      ...prev,
      [floor]: {
        ...prev[floor],
        desks: [...prev[floor].desks, newDeskId]
      }
    }));
  };

  const handleRenameDesk = (oldDeskId, newDeskId) => {
    if (!newDeskId || newDeskId === oldDeskId) {
      setRenamingDesk(null);
      return;
    }

    // Check if new name already exists
    const allDesks = Object.values(floorData).flatMap(f => f.desks);
    if (allDesks.includes(newDeskId)) {
      alert('A desk with this name already exists!');
      return;
    }

    const floor = selectedFloor;
    
    // Update floor data
    setFloorData(prev => ({
      ...prev,
      [floor]: {
        ...prev[floor],
        desks: prev[floor].desks.map(d => d === oldDeskId ? newDeskId : d)
      }
    }));

    // Update assignments
    if (assignments[oldDeskId]) {
      setAssignments(prev => {
        const updated = { ...prev };
        updated[newDeskId] = updated[oldDeskId];
        delete updated[oldDeskId];
        return updated;
      });
    }

    // Update positions
    if (deskPositions[floor] && deskPositions[floor][oldDeskId]) {
      setDeskPositions(prev => ({
        ...prev,
        [floor]: {
          ...prev[floor],
          [newDeskId]: prev[floor][oldDeskId]
        }
      }));
      
      // Remove old position
      setDeskPositions(prev => {
        const updated = { ...prev };
        if (updated[floor] && updated[floor][oldDeskId]) {
          delete updated[floor][oldDeskId];
        }
        return updated;
      });
    }

    setRenamingDesk(null);
    setNewDeskName('');
  };

  const handleDeleteDesk = (deskId) => {
    if (!window.confirm(`Are you sure you want to delete desk "${deskId}"? This will also remove any assignment.`)) {
      return;
    }

    const floor = selectedFloor;

    // Remove from floor data
    setFloorData(prev => ({
      ...prev,
      [floor]: {
        ...prev[floor],
        desks: prev[floor].desks.filter(d => d !== deskId)
      }
    }));

    // Remove assignment
    if (assignments[deskId]) {
      setAssignments(prev => {
        const updated = { ...prev };
        delete updated[deskId];
        return updated;
      });
    }

    // Remove position
    if (deskPositions[floor] && deskPositions[floor][deskId]) {
      setDeskPositions(prev => {
        const updated = { ...prev };
        if (updated[floor]) {
          delete updated[floor][deskId];
        }
        return updated;
      });
    }
  };

  const currentFloorData = floorData[selectedFloor];
  const occupiedDesks = currentFloorData.desks.filter(desk => assignments[desk]).length;
  const totalDesks = currentFloorData.desks.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: "'Outfit', 'Helvetica Neue', sans-serif",
      color: '#e2e8f0',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '3rem',
        borderBottom: '2px solid rgba(148, 163, 184, 0.2)',
        paddingBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em'
          }}>
            Oved Apparel Seating
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#94a3b8',
            margin: 0,
            fontWeight: '400'
          }}>
            31 West 34th Street • Seating Management System
          </p>
        </div>
        
        {/* Export/Import Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '12px',
              color: '#a78bfa',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
              e.currentTarget.style.borderColor = '#a78bfa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
            }}
          >
            <Save size={18} />
            Backup & Restore
          </button>
          
          {showExportMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: 'rgba(30, 41, 59, 0.98)',
              border: '2px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '12px',
              padding: '0.75rem',
              minWidth: '280px',
              zIndex: 1000,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#94a3b8',
                marginBottom: '0.75rem',
                padding: '0 0.5rem'
              }}>
                Data is stored in browser localStorage. Export to backup or transfer to another device.
              </div>
              
              <button
                onClick={handleExportData}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
              >
                📥 Export Data (Download JSON)
              </button>
              
              <label style={{
                width: '87.5%',
                padding: '0.75rem 1rem',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '8px',
                color: '#60a5fa',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
              >
                📤 Import Data (Upload JSON)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button
                onClick={handleClearAllData}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
              >
                🗑️ Clear All Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Toggle & Search */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '12px',
          padding: '4px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          flexWrap: 'wrap'
        }}>
          {['floor', 'map', 'floorplan', 'pdf', 'list'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: viewMode === mode 
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' 
                  : 'transparent',
                color: viewMode === mode ? '#fff' : '#94a3b8',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {mode === 'floor' ? <Building size={18} /> : mode === 'map' ? <MapPin size={18} /> : mode === 'floorplan' ? <MapPin size={18} /> : mode === 'pdf' ? <MapPin size={18} /> : <Users size={18} />}
              {mode === 'floor' ? 'Grid View' : mode === 'map' ? 'Map View' : mode === 'floorplan' ? 'Floorplan' : mode === 'pdf' ? 'PDF View' : 'Directory'}
            </button>
          ))}
        </div>

        <div style={{
          flex: '1',
          minWidth: '300px',
          position: 'relative'
        }}>
          <Search 
            size={20} 
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }}
          />
          <input
            type="text"
            placeholder="Search employees or desks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '90%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              color: '#e2e8f0',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(148, 163, 184, 0.2)'}
          />
        </div>

        <div style={{
          padding: '0.875rem 1.5rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          fontWeight: '600',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Users size={18} />
          {allEmployees.length} Employees
        </div>

        <button
          onClick={() => setShowDeskManagement(!showDeskManagement)}
          style={{
            padding: '0.875rem 1.5rem',
            background: 'rgba(249, 115, 22, 0.15)',
            border: '2px solid rgba(249, 115, 22, 0.4)',
            borderRadius: '12px',
            color: '#f97316',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(249, 115, 22, 0.25)';
            e.currentTarget.style.borderColor = '#f97316';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(249, 115, 22, 0.4)';
          }}
        >
          <Edit2 size={18} />
          Manage Desks
        </button>
      </div>

      {/* Desk Management Panel */}
      {showDeskManagement && (
        <div style={{
          marginBottom: '2rem',
          background: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '2px solid rgba(249, 115, 22, 0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: 0,
              color: '#f97316'
            }}>
              Manage Desks - {currentFloorData.name}
            </h3>
            <button
              onClick={handleAddDesk}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '10px',
                color: '#10b981',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
            >
              + Add New Desk
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '0.75rem',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {currentFloorData.desks.map(desk => (
              <div
                key={desk}
                style={{
                  background: 'rgba(51, 65, 85, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}
              >
                {renamingDesk === desk ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                    <input
                      type="text"
                      value={newDeskName}
                      onChange={(e) => setNewDeskName(e.target.value)}
                      placeholder="New desk name"
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '6px',
                        color: '#e2e8f0',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameDesk(desk, newDeskName);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleRenameDesk(desk, newDeskName)}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Save size={14} style={{ color: '#10b981' }} />
                    </button>
                    <button
                      onClick={() => {
                        setRenamingDesk(null);
                        setNewDeskName('');
                      }}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(100, 116, 139, 0.2)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} style={{ color: '#94a3b8' }} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{
                        fontWeight: '700',
                        color: '#e2e8f0',
                        fontSize: '0.95rem',
                        marginBottom: '0.25rem'
                      }}>
                        {desk}
                      </div>
                      {assignments[desk] && (
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#10b981'
                        }}>
                          {assignments[desk]}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setRenamingDesk(desk);
                          setNewDeskName(desk);
                        }}
                        style={{
                          padding: '0.5rem',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Rename desk"
                      >
                        <Edit2 size={14} style={{ color: '#60a5fa' }} />
                      </button>
                      <button
                        onClick={() => handleDeleteDesk(desk)}
                        style={{
                          padding: '0.5rem',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Delete desk"
                      >
                        <X size={14} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floor View */}
      {viewMode === 'floor' && (
        <>
          {/* Floor Selector */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {Object.entries(floorData).map(([floor, data]) => {
              const floorOccupied = data.desks.filter(d => assignments[d]).length;
              const floorTotal = data.desks.length;
              const isSelected = selectedFloor === parseInt(floor);
              
              return (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(parseInt(floor))}
                  style={{
                    padding: '1.25rem 1.75rem',
                    background: isSelected 
                      ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                      : 'rgba(30, 41, 59, 0.5)',
                    border: `2px solid ${isSelected ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    flex: '1',
                    minWidth: '180px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = '#64748b';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                  }}
                >
                  <div style={{
                    fontSize: '1.75rem',
                    fontWeight: '800',
                    color: isSelected ? '#fff' : '#e2e8f0',
                    marginBottom: '0.5rem'
                  }}>
                    {data.name}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                    fontWeight: '500'
                  }}>
                    {floorOccupied} / {floorTotal} desks
                  </div>
                  <div style={{
                    marginTop: '0.75rem',
                    height: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(floorOccupied / floorTotal) * 100}%`,
                      background: isSelected 
                        ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                        : '#3b82f6',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Floor Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>
                Total Desks
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#60a5fa' }}>
                {totalDesks}
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>
                Occupied
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>
                {occupiedDesks}
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(249, 115, 22, 0.1)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>
                Available
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f97316' }}>
                {totalDesks - occupiedDesks}
              </div>
            </div>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: '600' }}>
                Occupancy
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#a78bfa' }}>
                {totalDesks > 0 ? Math.round((occupiedDesks / totalDesks) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Desk Grid */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              color: '#e2e8f0'
            }}>
              Desk Assignments
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
              maxHeight: '600px',
              overflowY: 'auto',
              padding: '0.5rem'
            }}>
              {currentFloorData.desks.map(desk => {
                const isAssigned = !!assignments[desk];
                const isEditing = editingDesk === desk;
                
                return (
                  <div
                    key={desk}
                    style={{
                      padding: '1.25rem',
                      background: isAssigned 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))'
                        : 'rgba(51, 65, 85, 0.4)',
                      border: `2px solid ${isAssigned ? 'rgba(16, 185, 129, 0.4)' : 'rgba(148, 163, 184, 0.2)'}`,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => !isEditing && startEditing(desk)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <MapPin size={16} style={{ color: isAssigned ? '#10b981' : '#64748b' }} />
                        <span style={{
                          fontWeight: '700',
                          fontSize: '0.95rem',
                          color: isAssigned ? '#10b981' : '#94a3b8'
                        }}>
                          {desk}
                        </span>
                      </div>
                      {isAssigned && !isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAssignment(desk);
                          }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        >
                          <X size={14} style={{ color: '#ef4444' }} />
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Enter employee name"
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '0.625rem',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontSize: '0.95rem',
                            marginBottom: '0.75rem',
                            outline: 'none'
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && tempName.trim()) {
                              handleAssignDesk(desk, tempName.trim());
                            }
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => tempName.trim() && handleAssignDesk(desk, tempName.trim())}
                            style={{
                              flex: 1,
                              padding: '0.625rem',
                              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#fff',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <Save size={14} />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingDesk(null);
                              setTempName('');
                            }}
                            style={{
                              padding: '0.625rem',
                              background: 'rgba(100, 116, 139, 0.3)',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#94a3b8',
                              fontWeight: '600',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        {isAssigned ? (
                          <>
                            <Users size={14} style={{ color: '#94a3b8' }} />
                            <span style={{
                              color: '#e2e8f0',
                              fontSize: '0.95rem',
                              fontWeight: '500'
                            }}>
                              {assignments[desk]}
                            </span>
                            <Edit2 size={12} style={{ marginLeft: 'auto', color: '#64748b' }} />
                          </>
                        ) : (
                          <span style={{
                            color: '#64748b',
                            fontSize: '0.875rem',
                            fontStyle: 'italic'
                          }}>
                            Click to assign
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <>
          {/* Floor Selector for Map */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {Object.entries(floorData).map(([floor, data]) => {
              const floorOccupied = data.desks.filter(d => assignments[d]).length;
              const floorTotal = data.desks.length;
              const isSelected = selectedFloor === parseInt(floor);
              
              return (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(parseInt(floor))}
                  style={{
                    padding: '1rem 1.5rem',
                    background: isSelected 
                      ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                      : 'rgba(30, 41, 59, 0.5)',
                    border: `2px solid ${isSelected ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    flex: '1',
                    minWidth: '150px'
                  }}
                >
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: isSelected ? '#fff' : '#e2e8f0'
                  }}>
                    {data.name}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                    marginTop: '0.25rem'
                  }}>
                    {floorOccupied}/{floorTotal}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Floor Map */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                color: '#e2e8f0'
              }}>
                {currentFloorData.name} - Interactive Map
              </h2>
              <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#94a3b8'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    borderRadius: '3px'
                  }} />
                  Occupied
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#94a3b8'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'rgba(100, 116, 139, 0.4)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '3px'
                  }} />
                  Available
                </div>
              </div>
            </div>

            {/* Floor Map Layout */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '16px',
              padding: '3rem',
              minHeight: '600px',
              position: 'relative',
              overflow: 'auto'
            }}>
              {selectedFloor === 4 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '0.5rem',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  {/* Back End Section - 54 desks in 6x9 grid */}
                  <div style={{
                    gridColumn: 'span 6',
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px dashed rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#60a5fa',
                      marginBottom: '1rem',
                      textAlign: 'center'
                    }}>
                      BACK END
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '0.5rem'
                    }}>
                      {currentFloorData.desks.slice(0, 54).map(desk => {
                        const isAssigned = !!assignments[desk];
                        return (
                          <div
                            key={desk}
                            onClick={() => startEditing(desk)}
                            style={{
                              aspectRatio: '1',
                              background: isAssigned 
                                ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                                : 'rgba(100, 116, 139, 0.4)',
                              border: `1px solid ${isAssigned ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: '600',
                              color: isAssigned ? '#fff' : '#94a3b8',
                              transition: 'all 0.2s ease',
                              padding: '0.25rem',
                              textAlign: 'center',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                              e.currentTarget.style.zIndex = '10';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.zIndex = '1';
                            }}
                            title={isAssigned ? `${desk}: ${assignments[desk]}` : `${desk}: Available`}
                          >
                            <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{desk.split('-')[1]}</div>
                            {isAssigned && (
                              <div style={{
                                fontSize: '0.55rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                                marginTop: '2px'
                              }}>
                                {assignments[desk].split(' ')[0]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Private Offices Section */}
                  <div style={{
                    gridColumn: 'span 6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                  }}>
                    {/* Sales Offices */}
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.05)',
                      border: '1px dashed rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      padding: '1.5rem'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: '#a78bfa',
                        marginBottom: '1rem',
                        textAlign: 'center'
                      }}>
                        SALES OFFICES
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '0.5rem'
                      }}>
                        {currentFloorData.desks.slice(54, 64).map(desk => {
                          const isAssigned = !!assignments[desk];
                          return (
                            <div
                              key={desk}
                              onClick={() => startEditing(desk)}
                              style={{
                                aspectRatio: '1',
                                background: isAssigned 
                                  ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                                  : 'rgba(100, 116, 139, 0.4)',
                                border: `1px solid ${isAssigned ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                color: isAssigned ? '#fff' : '#94a3b8',
                                transition: 'all 0.2s ease',
                                padding: '0.25rem',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.zIndex = '10';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.zIndex = '1';
                              }}
                              title={isAssigned ? `${desk}: ${assignments[desk]}` : `${desk}: Available`}
                            >
                              <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>S{desk.split('-')[2]}</div>
                              {isAssigned && (
                                <div style={{
                                  fontSize: '0.55rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  width: '100%',
                                  marginTop: '2px'
                                }}>
                                  {assignments[desk].split(' ')[0]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Back End Offices */}
                    <div style={{
                      background: 'rgba(236, 72, 153, 0.05)',
                      border: '1px dashed rgba(236, 72, 153, 0.3)',
                      borderRadius: '12px',
                      padding: '1.5rem'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: '#ec4899',
                        marginBottom: '1rem',
                        textAlign: 'center'
                      }}>
                        BACK END OFFICES
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.5rem'
                      }}>
                        {currentFloorData.desks.slice(64).map(desk => {
                          const isAssigned = !!assignments[desk];
                          return (
                            <div
                              key={desk}
                              onClick={() => startEditing(desk)}
                              style={{
                                aspectRatio: '1.2',
                                background: isAssigned 
                                  ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                                  : 'rgba(100, 116, 139, 0.4)',
                                border: `1px solid ${isAssigned ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                color: isAssigned ? '#fff' : '#94a3b8',
                                transition: 'all 0.2s ease',
                                padding: '0.25rem',
                                textAlign: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.zIndex = '10';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.zIndex = '1';
                              }}
                              title={isAssigned ? `${desk}: ${assignments[desk]}` : `${desk}: Available`}
                            >
                              <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>
                                {desk.includes('IT') ? 'IT' : desk.includes('Issac') ? 'IS' : desk.split('-')[2] || desk.split('-')[1]}
                              </div>
                              {isAssigned && (
                                <div style={{
                                  fontSize: '0.55rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  width: '100%',
                                  marginTop: '2px'
                                }}>
                                  {assignments[desk].split(' ')[0]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedFloor === 5 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(20, 1fr)',
                  gap: '0.4rem',
                  maxWidth: '1400px',
                  margin: '0 auto'
                }}>
                  {currentFloorData.desks.filter(d => !d.includes('Office')).map(desk => {
                    const isAssigned = !!assignments[desk];
                    return (
                      <div
                        key={desk}
                        onClick={() => startEditing(desk)}
                        style={{
                          aspectRatio: '1',
                          background: isAssigned 
                            ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                            : 'rgba(100, 116, 139, 0.4)',
                          border: `1px solid ${isAssigned ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6rem',
                          fontWeight: '600',
                          color: isAssigned ? '#fff' : '#94a3b8',
                          transition: 'all 0.2s ease',
                          padding: '0.15rem',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.15)';
                          e.currentTarget.style.zIndex = '10';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.zIndex = '1';
                        }}
                        title={isAssigned ? `${desk}: ${assignments[desk]}` : `${desk}: Available`}
                      >
                        <div style={{ fontSize: '0.55rem' }}>{desk}</div>
                        {isAssigned && (
                          <div style={{
                            fontSize: '0.5rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%',
                            marginTop: '1px'
                          }}>
                            {assignments[desk].split(' ')[0]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Offices Section */}
                  <div style={{
                    gridColumn: 'span 20',
                    marginTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {currentFloorData.desks.filter(d => d.includes('Office')).map(desk => {
                      const isAssigned = !!assignments[desk];
                      return (
                        <div
                          key={desk}
                          onClick={() => startEditing(desk)}
                          style={{
                            aspectRatio: '1.5',
                            background: isAssigned 
                              ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                              : 'rgba(100, 116, 139, 0.4)',
                            border: `2px solid ${isAssigned ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            color: isAssigned ? '#fff' : '#94a3b8',
                            transition: 'all 0.2s ease',
                            padding: '0.5rem',
                            textAlign: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.zIndex = '10';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.zIndex = '1';
                          }}
                          title={isAssigned ? `${desk}: ${assignments[desk]}` : `${desk}: Available`}
                        >
                          <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>{desk}</div>
                          {isAssigned && (
                            <div style={{
                              fontSize: '0.6rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              width: '100%',
                              marginTop: '3px'
                            }}>
                              {assignments[desk]}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedFloor === 6 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  gap: '0.75rem',
                  maxWidth: '1000px',
                  margin: '0 auto'
                }}>
                  {currentFloorData.desks.map(desk => {
                    const isAssigned = !!assignments[desk];
                    const isCanon = desk.includes('Canon');
                    return (
                      <div
                        key={desk}
                        onClick={() => startEditing(desk)}
                        style={{
                          aspectRatio: isCanon ? '1.5' : '1',
                          gridColumn: isCanon ? 'span 2' : 'span 1',
                          background: isAssigned 
                            ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                            : 'rgba(100, 116, 139, 0.4)',
                          border: `1px solid ${isAssigned ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          color: isAssigned ? '#fff' : '#94a3b8',
                          transition: 'all 0.2s ease',
                          padding: '0.5rem',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.zIndex = '10';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.zIndex = '1';
                        }}
                        title={isAssigned ? `${desk}: ${assignments[desk]}` : `${desk}: Available`}
                      >
                        <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>{desk}</div>
                        {isAssigned && (
                          <div style={{
                            fontSize: '0.6rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%',
                            marginTop: '3px'
                          }}>
                            {assignments[desk]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedFloor === 9 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gap: '0.5rem',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  {currentFloorData.desks.map(desk => {
                    const isAssigned = !!assignments[desk];
                    const isDouble = desk.includes('-A') || desk.includes('-B');
                    return (
                      <div
                        key={desk}
                        onClick={() => startEditing(desk)}
                        style={{
                          aspectRatio: '1',
                          background: isAssigned 
                            ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                            : 'rgba(100, 116, 139, 0.4)',
                          border: `1px solid ${isAssigned ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          color: isAssigned ? '#fff' : '#94a3b8',
                          transition: 'all 0.2s ease',
                          padding: '0.25rem',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.zIndex = '10';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.zIndex = '1';
                        }}
                        title={isAssigned ? `${desk}: ${assignments[desk]}` : `${desk}: Available`}
                      >
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{desk.replace('D', '')}</div>
                        {isAssigned && (
                          <div style={{
                            fontSize: '0.55rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%',
                            marginTop: '2px'
                          }}>
                            {assignments[desk].split(' ')[0]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Click instruction */}
              <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                color: '#60a5fa',
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}>
                Click any desk to assign an employee
              </div>
            </div>
          </div>
        </>
      )}

      {/* Floorplan View with Actual PDF Images */}
      {viewMode === 'floorplan' && (
        <>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {Object.entries(floorData).map(([floor, data]) => {
              const floorOccupied = data.desks.filter(d => assignments[d]).length;
              const floorTotal = data.desks.length;
              const isSelected = selectedFloor === parseInt(floor);
              
              return (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(parseInt(floor))}
                  style={{
                    padding: '1rem 1.5rem',
                    background: isSelected 
                      ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                      : 'rgba(30, 41, 59, 0.5)',
                    border: `2px solid ${isSelected ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    flex: '1',
                    minWidth: '150px'
                  }}
                >
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: isSelected ? '#fff' : '#e2e8f0'
                  }}>
                    {data.name}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                    marginTop: '0.25rem'
                  }}>
                    {floorOccupied}/{floorTotal}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                color: '#e2e8f0'
              }}>
                {currentFloorData.name} - Floorplan with Assignments
              </h2>
              <div style={{
                padding: '0.75rem 1.25rem',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                fontWeight: '600',
                color: '#10b981',
                fontSize: '0.9rem'
              }}>
                {occupiedDesks} / {totalDesks} Assigned
              </div>
            </div>

            {/* Assigned Employees List Over Floorplan */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '16px',
              padding: '2rem',
              minHeight: '600px'
            }}>
              <div style={{
                marginBottom: '2rem',
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#60a5fa',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                <MapPin size={20} />
                <span>Showing all assigned employees for {currentFloorData.name}. Click any card to edit.</span>
              </div>

              {occupiedDesks > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  {currentFloorData.desks.map(desk => {
                    const employeeName = assignments[desk];
                    if (!employeeName) return null;
                    return (
                      <div
                        key={desk}
                        onClick={() => startEditing(desk)}
                        style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))',
                          padding: '1.5rem',
                          borderRadius: '12px',
                          border: '2px solid rgba(16, 185, 129, 0.4)',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                          e.currentTarget.style.borderColor = '#10b981';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '1.3rem',
                            color: '#fff',
                            flexShrink: 0
                          }}>
                            {employeeName.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '1.1rem',
                              color: '#e2e8f0',
                              fontWeight: '700',
                              marginBottom: '0.25rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {employeeName}
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.9rem',
                              color: '#94a3b8'
                            }}>
                              <MapPin size={14} />
                              <span>{desk}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#64748b',
                          fontStyle: 'italic',
                          textAlign: 'right'
                        }}>
                          Click to edit
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem',
                  color: '#64748b'
                }}>
                  <Users size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{
                    fontSize: '1.25rem',
                    color: '#94a3b8',
                    margin: '0 0 0.5rem 0',
                    fontWeight: '600'
                  }}>
                    No employees assigned yet
                  </p>
                  <p style={{
                    fontSize: '0.95rem',
                    margin: 0
                  }}>
                    Switch to Grid View to start assigning desks
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* PDF View - Enhanced Floorplan Layout */}
      {viewMode === 'pdf' && (
        <>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {Object.entries(floorData).map(([floor, data]) => {
              const floorOccupied = data.desks.filter(d => assignments[d]).length;
              const floorTotal = data.desks.length;
              const isSelected = selectedFloor === parseInt(floor);
              
              return (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(parseInt(floor))}
                  style={{
                    padding: '1rem 1.5rem',
                    background: isSelected 
                      ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                      : 'rgba(30, 41, 59, 0.5)',
                    border: `2px solid ${isSelected ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)',
                    flex: '1',
                    minWidth: '150px'
                  }}
                >
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: isSelected ? '#fff' : '#e2e8f0'
                  }}>
                    {data.name}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: isSelected ? 'rgba(255,255,255,0.8)' : '#94a3b8',
                    marginTop: '0.25rem'
                  }}>
                    {floorOccupied}/{floorTotal}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                margin: 0,
                color: '#e2e8f0'
              }}>
                {currentFloorData.name} - PDF Floorplan View
              </h2>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Zoom Controls */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  background: 'rgba(30, 41, 59, 0.5)',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <button
                    onClick={handleZoomOut}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '6px',
                      color: '#60a5fa',
                      fontWeight: '700',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                  >
                    −
                  </button>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    color: '#e2e8f0',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    {Math.round(zoomLevel * 100)}%
                  </div>
                  <button
                    onClick={handleZoomIn}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: '6px',
                      color: '#60a5fa',
                      fontWeight: '700',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                  >
                    +
                  </button>
                  <button
                    onClick={handleResetZoom}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(100, 116, 139, 0.2)',
                      border: '1px solid rgba(100, 116, 139, 0.4)',
                      borderRadius: '6px',
                      color: '#94a3b8',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)'}
                  >
                    Reset
                  </button>
                </div>
                
                <div style={{
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  fontWeight: '600',
                  color: '#10b981',
                  fontSize: '0.9rem'
                }}>
                  {occupiedDesks} / {totalDesks} Assigned
                </div>
              </div>
            </div>

            <div 
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative',
                minHeight: '800px',
                overflow: 'hidden',
                cursor: isPanning ? 'grabbing' : 'grab'
              }}
              onMouseDown={handlePanStart}
              onMouseMove={handlePanMove}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
              onWheel={handleWheel}
            >
              <div style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transformOrigin: '0 0',
                transition: isPanning ? 'none' : 'transform 0.2s ease'
              }}>
              <PDFFloorplanViewer pdfUrl={currentFloorData.pdfUrl}>
                {/* Employee name overlays - draggable to match actual desk locations */}
                {occupiedDesks > 0 && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: 'none',
                      zIndex: 10
                    }}
                    onDragOver={handleDragOver}
                  >
                    {currentFloorData.desks.map((desk, index) => {
                      const employeeName = assignments[desk];
                      if (!employeeName) return null;
                      
                      const position = getDeskPosition(desk, index);
                      
                      return (
                        <div
                          key={desk}
                          data-desk={desk}
                          draggable
                          onDragStart={(e) => handleDragStart(e, desk)}
                          onDrag={(e) => handleDrag(e, desk)}
                          onDragEnd={(e) => handleDragEnd(e, desk)}
                          onClick={(e) => {
                            if (!draggingDesk && !isPanning) {
                              e.stopPropagation();
                              startEditing(desk);
                            }
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            left: `${position.left}%`,
                            top: `${position.top}%`,
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.90), rgba(6, 182, 212, 0.90))',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            border: '1px solid #10b981',
                            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                            cursor: draggingDesk === desk ? 'grabbing' : 'grab',
                            transition: draggingDesk === desk ? 'none' : 'all 0.2s ease',
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                            pointerEvents: 'auto',
                            minWidth: '35px',
                            maxWidth: '55px',
                            userSelect: 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!draggingDesk) {
                              e.currentTarget.style.transform = 'scale(1.3)';
                              e.currentTarget.style.zIndex = '100';
                              e.currentTarget.style.boxShadow = '0 2px 10px rgba(16, 185, 129, 0.6)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!draggingDesk) {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.zIndex = '10';
                              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
                            }
                          }}
                        >
                          <div style={{
                            fontSize: '6px',
                            color: 'rgba(255,255,255,0.85)',
                            fontWeight: '700',
                            marginBottom: '1px',
                            textAlign: 'center',
                            letterSpacing: '0.2px',
                            lineHeight: '1'
                          }}>
                            {desk}
                          </div>
                          <div style={{
                            fontSize: '7px',
                            color: '#ffffff',
                            fontWeight: '800',
                            textAlign: 'center',
                            wordBreak: 'break-word',
                            lineHeight: '1',
                            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {employeeName.split(' ')[0].substring(0, 8)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* No assignments message */}
                {occupiedDesks === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    padding: '3rem',
                    background: 'rgba(30, 41, 59, 0.97)',
                    borderRadius: '16px',
                    border: '2px solid rgba(148, 163, 184, 0.3)',
                    zIndex: '50',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Users size={64} style={{ color: '#64748b', marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{
                      fontSize: '1.25rem',
                      color: '#94a3b8',
                      margin: '0 0 0.5rem 0',
                      fontWeight: '600'
                    }}>
                      No employees assigned yet
                    </p>
                    <p style={{
                      fontSize: '0.95rem',
                      color: '#64748b',
                      margin: 0
                    }}>
                      Switch to Grid View to start assigning desks
                    </p>
                  </div>
                )}
              </PDFFloorplanViewer>
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              color: '#60a5fa',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <MapPin size={20} />
                <span>Compact name labels optimized for 400+ desks. Zoom in to see details clearly.</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '2rem', lineHeight: '1.5' }}>
                • <strong>Zoom:</strong> Use +/− buttons or mouse wheel • <strong>Pan:</strong> Click and drag background • <strong>Reposition:</strong> Drag name labels to desk locations • <strong>Edit:</strong> Click labels to change assignments • <strong>Hover:</strong> Labels scale up 30% for readability
              </div>
            </div>
          </div>
        </>
      )}

      
      {viewMode === 'list' && (
        <div style={{
          background: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#e2e8f0'
          }}>
            Employee Directory
          </h2>
          
          {searchTerm ? (
            // Search results
            <div>
              <p style={{
                color: '#94a3b8',
                marginBottom: '1rem',
                fontSize: '0.95rem'
              }}>
                Found {filteredEmployees.length} result{filteredEmployees.length !== 1 ? 's' : ''}
              </p>
              {filteredEmployees.map((emp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem 1.25rem',
                    background: 'rgba(51, 65, 85, 0.4)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '12px',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(51, 65, 85, 0.6)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.25rem' }}>
                      {emp.name}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      Desk {emp.desk}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#fff'
                  }}>
                    Floor {emp.floor}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Group by floor
            Object.entries(floorData).map(([floor, data]) => {
              const floorEmployees = employeesByFloor[floor] || [];
              if (floorEmployees.length === 0) return null;
              
              return (
                <div key={floor} style={{ marginBottom: '2rem' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#60a5fa',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <Building size={20} />
                    {data.name}
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#94a3b8',
                      background: 'rgba(59, 130, 246, 0.2)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px'
                    }}>
                      {floorEmployees.length} employee{floorEmployees.length !== 1 ? 's' : ''}
                    </span>
                  </h3>
                  <div style={{
                    display: 'grid',
                    gap: '0.75rem'
                  }}>
                    {floorEmployees.map((emp, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '1rem 1.25rem',
                          background: 'rgba(51, 65, 85, 0.4)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(51, 65, 85, 0.6)';
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)';
                          e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            color: '#fff'
                          }}>
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.25rem' }}>
                              {emp.name}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <MapPin size={12} />
                              Desk {emp.desk}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setViewMode('floor');
                            setSelectedFloor(emp.floor);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            borderRadius: '8px',
                            color: '#60a5fa',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                          }}
                        >
                          View Floor
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
          
          {allEmployees.length === 0 && !searchTerm && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b',
              fontSize: '1.1rem'
            }}>
              <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No employees assigned yet</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
                Switch to Floor View to start assigning desks
              </p>
            </div>
          )}
          
          {searchTerm && filteredEmployees.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b',
              fontSize: '1.1rem'
            }}>
              <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No results found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeatingApp;