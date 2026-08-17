import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  Book,
  FileText,
  CalendarCheck,
  CheckSquare,
  BarChart2,
  FileSpreadsheet,
  Printer,
  Edit3,
  Grid,
  Key,
  CreditCard,
  Receipt,
  Layers,
  History,
  AlertCircle,
  Settings,
  Sliders,
  RotateCw,
  Globe,
  Award,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

export default function Sidebar({ role, activeTab, subTab, onSelectTab, onLogout, user, isOpen, onClose, settings }) {
  // Keep track of expanded sub-menus
  const [openMenus, setOpenMenus] = useState({});

  const navItems = {
    admin: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'teachers', label: 'Teachers', icon: GraduationCap },
      { id: 'classes', label: 'Classes', icon: School },
      {
        id: 'subjects',
        label: 'Subjects',
        icon: BookOpen,
        subItems: [
          { id: 'list', label: 'All Subjects', icon: Book },
          { id: 'schemes', label: 'Scheme of Work', icon: FileText }
        ]
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: CalendarCheck,
        subItems: [
          { id: 'mark', label: 'Mark Attendance', icon: CheckSquare },
          { id: 'report', label: 'Attendance Report', icon: BarChart2 }
        ]
      },
      {
        id: 'student-results',
        label: 'Student Results',
        icon: FileSpreadsheet,
        subItems: [
          { id: 'bulk', label: 'Print Bulk Results', icon: Printer },
          { id: 'single', label: 'Single Result View', icon: FileText },
          { id: 'enter-marks', label: 'Enter Marks', icon: Edit3 },
          { id: 'broadsheet', label: 'Class Broadsheet', icon: Grid },
          { id: 'pins', label: 'Scratch Cards / PINs', icon: Key }
        ]
      },
      {
        id: 'fees',
        label: 'School Fees',
        icon: CreditCard,
        subItems: [
          { id: 'invoices', label: 'Invoices & Billing', icon: Receipt },
          { id: 'structures', label: 'Fee Structures', icon: Layers },
          { id: 'report', label: 'Payment Records', icon: History },
          { id: 'summary', label: 'Debtors Summary', icon: AlertCircle }
        ]
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        subItems: [
          { id: 'academic', label: 'Academic Settings', icon: Sliders },
          { id: 'sessions', label: 'Session Rollover', icon: RotateCw },
          { id: 'landing', label: 'Portal Landing Settings', icon: Globe },
          { id: 'grading', label: 'Grading System', icon: Award },
          { id: 'skills', label: 'Behavioral Domains', icon: Sparkles },
          { id: 'promotions', label: 'Student Promotions', icon: TrendingUp }
        ]
      }
    ],
    teacher: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'grades', label: 'Enter Marks', icon: Edit3 },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: CalendarCheck,
        subItems: [
          { id: 'take', label: 'Take Attendance', icon: CheckSquare },
          { id: 'report', label: 'Attendance Reports', icon: BarChart2 }
        ]
      },
      { id: 'broadsheet', label: 'Class Results', icon: FileSpreadsheet },
      { id: 'schemes', label: 'Scheme of Work', icon: FileText }
    ],
    student: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'results', label: 'My Results', icon: Award },
      { id: 'schemes', label: 'Scheme of Work', icon: FileText },
      { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
      { id: 'rules', label: 'School Rules', icon: ShieldCheck }
    ]
  };

  const items = navItems[role] || [];

  // Automatically expand menu if the active tab has subItems
  useEffect(() => {
    if (activeTab) {
      setOpenMenus(prev => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab]);

  const toggleMenu = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleTabClick = (item, subItemId = null) => {
    if (item.subItems && !subItemId) {
      // Toggle collapse/expand on parent click
      toggleMenu(item.id);
      // Select first subItem by default if expanding
      if (!openMenus[item.id] && item.subItems.length > 0) {
        onSelectTab(item.id, item.subItems[0].id);
      } else {
        onSelectTab(item.id, subTab || item.subItems[0].id);
      }
    } else if (subItemId) {
      onSelectTab(item.id, subItemId);
    } else {
      onSelectTab(item.id, null);
    }

    if (onClose) onClose(); // Close mobile drawer
  };

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`} style={{
      width: '280px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      transition: 'transform 0.3s ease',
      zIndex: 90
    }}>
      {/* Branding Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0, 114, 255, 0.25)'
          }}>
            <School size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', margin: 0, letterSpacing: '0.5px' }}>
              {settings?.landing_school_name || 'Jere Model Academy'}
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '1px' }}>
              ACADEMIC PORTAL
            </span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="mobile-only" 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation List */}
      <nav style={{
        padding: '16px 12px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto'
      }}>
        {items.map(item => {
          const Icon = item.icon;
          const hasSub = item.subItems && item.subItems.length > 0;
          const isExpanded = !!openMenus[item.id];
          const isParentActive = activeTab === item.id;

          return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Main Item Button */}
              <button
                onClick={() => handleTabClick(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: isParentActive ? '600' : '500',
                  backgroundColor: isParentActive ? 'var(--primary-light)' : 'transparent',
                  color: isParentActive ? 'var(--primary)' : 'var(--text-primary)',
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} style={{ color: isParentActive ? 'var(--primary)' : 'var(--text-secondary)' }} />
                  <span>{item.label}</span>
                </div>
                {hasSub && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(item.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                )}
              </button>

              {/* Sub-Items Collapsible Container */}
              {hasSub && isExpanded && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  marginLeft: '20px',
                  paddingLeft: '12px',
                  borderLeft: '2px solid var(--border-color)',
                  marginTop: '4px',
                  marginBottom: '6px'
                }}>
                  {item.subItems.map(subItem => {
                    const SubIcon = subItem.icon;
                    const isSubActive = isParentActive && subTab === subItem.id;

                    return (
                      <button
                        key={subItem.id}
                        onClick={() => handleTabClick(item, subItem.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          width: '100%',
                          padding: '8px 12px',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.83rem',
                          fontWeight: isSubActive ? '600' : '400',
                          backgroundColor: isSubActive ? 'rgba(0, 114, 255, 0.12)' : 'transparent',
                          color: isSubActive ? 'var(--primary)' : 'var(--text-secondary)',
                          textAlign: 'left',
                          transition: 'var(--transition)'
                        }}
                      >
                        <SubIcon size={15} style={{ color: isSubActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        {settings?.landing_school_name || 'Jere Model Academy'} Portal v1.0
      </div>
    </aside>
  );
}

