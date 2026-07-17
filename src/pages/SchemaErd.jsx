import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Database, Search, ShieldAlert, Key, Clipboard, Check,
  Plus, Minus, Expand, X, GitMerge, FileCode, CheckCircle, Maximize, Download
} from 'lucide-react';
import './SchemaErd.css';

// Database Schema entities data structure from the HTML source
const ENTITIES = [
  {
    name: "Company",
    description: "Root organization entity holding global identities, business hours, and operational addresses.",
    columns: [
      { name: "Id", type: "int", pk: true, fk: false, nullable: false, description: "Primary Key identity increment column." },
      { name: "Code", type: "string", pk: false, fk: false, nullable: false, description: "Company identifier code (e.g. COM1)." },
      { name: "Name", type: "string", pk: false, fk: false, nullable: false, description: "Official business name." },
      { name: "ShortName", type: "string", pk: false, fk: false, nullable: true, description: "Abbreviated company name for display shortcuts." },
      { name: "RegistrationNumber", type: "string", pk: false, fk: false, nullable: true, description: "Official corporate incorporation registration number." },
      { name: "GSTNumber", type: "string", pk: false, fk: false, nullable: true, description: "Tax identification Goods & Services Tax registration number." },
      { name: "Email", type: "string", pk: false, fk: false, nullable: true, description: "Official corporate support email." },
      { name: "PhoneNumber", type: "string", pk: false, fk: false, nullable: true, description: "Primary contact phone number." },
      { name: "Website", type: "string", pk: false, fk: false, nullable: true, description: "Website URL address." },
      { name: "StreetAddress", type: "string", pk: false, fk: false, nullable: true, description: "Office headquarter street address details." },
      { name: "City", type: "string", pk: false, fk: false, nullable: true, description: "Address city." },
      { name: "State", type: "string", pk: false, fk: false, nullable: true, description: "Address state." },
      { name: "PostalCode", type: "string", pk: false, fk: false, nullable: true, description: "Mailing ZIP or Postal code." },
      { name: "Country", type: "string", pk: false, fk: false, nullable: true, description: "Address country location." },
      { name: "Logo", type: "string", pk: false, fk: false, nullable: true, description: "File path or URL of company logo image." },
      { name: "Prefix", type: "string", pk: false, fk: false, nullable: true, description: "Automatic naming prefix assigned for invoices/vouchers." },
      { name: "Suffix", type: "string", pk: false, fk: false, nullable: true, description: "Automatic naming suffix assigned for billing identifiers." },
      { name: "OpeningTime", type: "string", pk: false, fk: false, nullable: true, description: "Working hours start time." },
      { name: "ClosingTime", type: "string", pk: false, fk: false, nullable: true, description: "Working hours closure time." },
      { name: "Status", type: "bool", pk: false, fk: false, nullable: false, description: "Indicates active (true) or suspended/inactive (false) status." },
      { name: "IsDeleted", type: "bool", pk: false, fk: false, nullable: false, description: "Soft deletion indicator for archiving records." },
      { name: "CreatedBy", type: "int", pk: false, fk: false, nullable: false, description: "Audit trail user ID who created the record." },
      { name: "CreatedDate", type: "DateTime", pk: false, fk: false, nullable: false, description: "Creation date and time." },
      { name: "ModifiedBy", type: "int", pk: false, fk: false, nullable: false, description: "Audit trail user ID who updated the record last." },
      { name: "ModifiedDate", type: "DateTime", pk: false, fk: false, nullable: false, description: "Latest modification date and time." }
    ],
    relations: [
      { target: "Branch", type: "one-to-many", field: "CompanyId", description: "Houses multiple operating branch offices" },
      { target: "Users", type: "one-to-many", field: "CompanyId", description: "Directly registers corporate users" }
    ]
  },
  {
    name: "Branch",
    description: "Operating branch locations belonging to a Company. Holds contact and management metadata.",
    columns: [
      { name: "Id", type: "int", pk: true, fk: false, nullable: false, description: "Primary Key identity increment column." },
      { name: "CompanyId", type: "int", pk: false, fk: true, nullable: false, description: "Foreign key referencing parent Company record." },
      { name: "Code", type: "string", pk: false, fk: false, nullable: false, description: "Unique branch identifier code (e.g. BR01)." },
      { name: "Name", type: "string", pk: false, fk: false, nullable: false, description: "Branch office name." },
      { name: "ShortName", type: "string", pk: false, fk: false, nullable: true, description: "Short description name." },
      { name: "Email", type: "string", pk: false, fk: false, nullable: true, description: "Branch contact email." },
      { name: "PhoneNumber", type: "string", pk: false, fk: false, nullable: true, description: "Primary branch phone line." },
      { name: "AlternatePhone", type: "string", pk: false, fk: false, nullable: true, description: "Alternate backup branch phone line." },
      { name: "Address", type: "string", pk: false, fk: false, nullable: true, description: "Branch street address." },
      { name: "City", type: "string", pk: false, fk: false, nullable: true, description: "Address city." },
      { name: "Country", type: "string", pk: false, fk: false, nullable: true, description: "Address country." },
      { name: "PinCode", type: "int", pk: false, fk: false, nullable: true, description: "ZIP or Postal code." },
      { name: "ManagerName", type: "string", pk: false, fk: false, nullable: true, description: "Name of the branch manager." },
      { name: "ManagerEmail", type: "string", pk: false, fk: false, nullable: true, description: "Contact email of the branch manager." },
      { name: "ManagerPhone", type: "string", pk: false, fk: false, nullable: true, description: "Phone number of the branch manager." },
      { name: "OpeningDate", type: "DateTime", pk: false, fk: false, nullable: false, description: "Date when the branch was launched." },
      { name: "ClosingDate", type: "DateTime", pk: false, fk: false, nullable: true, description: "Date when branch stopped operations (if closed)." },
      { name: "Status", type: "bool", pk: false, fk: false, nullable: false, description: "Indicates active or inactive operating status." },
      { name: "IsDeleted", type: "bool", pk: false, fk: false, nullable: false, description: "Soft deletion indicator." },
      { name: "CreatedBy", type: "int", pk: false, fk: false, nullable: false, description: "User ID of creator." },
      { name: "CreatedDate", type: "DateTime", pk: false, fk: false, nullable: false, description: "Record creation timestamp." },
      { name: "ModifiedBy", type: "int", pk: false, fk: false, nullable: false, description: "User ID of modifier." },
      { name: "ModifiedDate", type: "DateTime", pk: false, fk: false, nullable: false, description: "Record modification timestamp." }
    ],
    relations: [
      { target: "Company", type: "many-to-one", field: "CompanyId", description: "Belongs to Parent Company" },
      { target: "UserBranch", type: "one-to-many", field: "BranchId", description: "Linked to staff/users via bridge table" },
      { target: "Customer", type: "one-to-many", field: "BranchId", description: "Customers registered or managed in this branch location" }
    ]
  },
  {
    name: "Users",
    description: "System user profiles, representing employees, administrators, and managers with secure credentials.",
    columns: [
      { name: "Id", type: "int", pk: true, fk: false, nullable: false, description: "Primary Key identity increment column." },
      { name: "UserName", type: "string", pk: false, fk: false, nullable: false, description: "Unique portal login username." },
      { name: "Password", type: "string", pk: false, fk: false, nullable: false, description: "Hashed secure password string." },
      { name: "Email", type: "string", pk: false, fk: false, nullable: true, description: "Direct email address." },
      { name: "PhoneNumber", type: "string", pk: false, fk: false, nullable: true, description: "Contact phone number." },
      { name: "RoleId", type: "int", pk: false, fk: true, nullable: false, description: "Foreign key referencing Role table." },
      { name: "FirstName", type: "string", pk: false, fk: false, nullable: true, description: "User's first name." },
      { name: "LastName", type: "string", pk: false, fk: false, nullable: true, description: "User's last name." },
      { name: "FullName", type: "string", pk: false, fk: false, nullable: true, description: "Cached full name representation (FirstName + LastName)." },
      { name: "NickName", type: "string", pk: false, fk: false, nullable: true, description: "Display name nickname." },
      { name: "Address", type: "string", pk: false, fk: false, nullable: true, description: "Residential street address." },
      { name: "CompanyId", type: "int", pk: false, fk: true, nullable: false, description: "Foreign key referencing direct parent Company." },
      { name: "Photo", type: "string", pk: false, fk: false, nullable: true, description: "Profile photo image path." },
      { name: "Sign", type: "string", pk: false, fk: false, nullable: true, description: "Digital signature image path for signing authorizations." },
      { name: "Status", type: "bool", pk: false, fk: false, nullable: false, description: "Indicates active or inactive status." },
      { name: "IsDeleted", type: "bool", pk: false, fk: false, nullable: false, description: "Soft deletion indicator." },
      { name: "LastLoginAt", type: "DateTime", pk: false, fk: false, nullable: true, description: "Last time the user logged into the system." },
      { name: "FcmToken", type: "string", pk: false, fk: false, nullable: true, description: "Firebase Cloud Messaging token for push notifications." },
      { name: "CreatedBy", type: "int", pk: false, fk: false, nullable: true, description: "User ID of creator." },
      { name: "CreatedDate", type: "DateTime", pk: false, fk: false, nullable: false, description: "Creation date." },
      { name: "ModifiedBy", type: "int", pk: false, fk: false, nullable: true, description: "User ID of last modifier." },
      { name: "ModifiedDate", type: "DateTime", pk: false, fk: false, nullable: true, description: "Latest modification date." }
    ],
    relations: [
      { target: "Role", type: "many-to-one", field: "RoleId", description: "Carries security profile settings" },
      { target: "Company", type: "many-to-one", field: "CompanyId", description: "Direct parent company navigation link" },
      { target: "UserBranch", type: "one-to-many", field: "UserId", description: "List of authorized branch mappings" },
      { target: "UserLog", type: "one-to-many", field: "UserId", description: "System auditing logs generated by this user" }
    ]
  },
  {
    name: "UserBranch",
    description: "Composite Bridge entity defining the Many-to-Many mapping between Users and Branches.",
    columns: [
      { name: "UserId", type: "int", pk: true, fk: true, nullable: false, description: "Part of composite PK. Foreign Key to Users." },
      { name: "BranchId", type: "int", pk: true, fk: true, nullable: false, description: "Part of composite PK. Foreign Key to Branch." },
      { name: "Id", type: "int", pk: false, fk: false, nullable: false, description: "Standard identity key (database config overrides as composite key on UserId + BranchId)." },
      { name: "CreatedDate", type: "DateTime", pk: false, fk: false, nullable: false, description: "Record creation date." },
      { name: "ModifiedDate", type: "DateTime", pk: false, fk: false, nullable: false, description: "Record modification date." },
      { name: "CreatedBy", type: "int", pk: false, fk: false, nullable: false, description: "User ID of creator." },
      { name: "ModifiedBy", type: "int", pk: false, fk: false, nullable: false, description: "User ID of modifier." },
      { name: "IsDefault", type: "bool", pk: false, fk: false, nullable: false, description: "Flags this branch as the primary workspace location." }
    ],
    relations: [
      { target: "Users", type: "many-to-one", field: "UserId", description: "Link to user profile" },
      { target: "Branch", type: "many-to-one", field: "BranchId", description: "Link to branch location" }
    ]
  },
  {
    name: "Role",
    description: "Defines security profiles, grouping authorization types (admin, manager, user).",
    columns: [
      { name: "Id", type: "int", pk: true, fk: false, nullable: false, description: "Primary Key identity increment column." },
      { name: "Name", type: "string", pk: false, fk: false, nullable: false, description: "Display name of the role (e.g., Admin, Manager)." },
      { name: "UserType", type: "UserTypes (enum)", pk: false, fk: false, nullable: false, description: "Core Enum representing user category: 0 = admin, 1 = manager, 2 = user." },
      { name: "CodeName", type: "string", pk: false, fk: false, nullable: false, description: "System slug code name used in policies and code attributes (e.g. 'admin')." },
      { name: "Status", type: "bool", pk: false, fk: false, nullable: false, description: "Indicates active or inactive state." }
    ],
    relations: [
      { target: "Users", type: "one-to-many", field: "RoleId", description: "Users holding this security clearance role" },
      { target: "MenuPermission", type: "one-to-many", field: "RoleId", description: "Authorized menu layouts and access permissions" }
    ]
  },
  {
    name: "Menu",
    description: "Recursive entity mapping the application sidebar menu items and navigation routes.",
    columns: [
      { name: "Id", type: "int", pk: true, fk: false, nullable: false, description: "Primary Key identity increment column." },
      { name: "Title", type: "string", pk: false, fk: false, nullable: false, description: "Menu text header displayed on frontend." },
      { name: "Path", type: "string", pk: false, fk: false, nullable: true, description: "Frontend web router link path." },
      { name: "Icon", type: "string", pk: false, fk: false, nullable: true, description: "CSS class for icons (e.g. 'fa fa-home')." },
      { name: "OrderNumber", type: "int", pk: false, fk: false, nullable: false, description: "Sort index order for sidebar menus layout rendering." },
      { name: "IsParent", type: "bool", pk: false, fk: false, nullable: false, description: "Determines if this acts as a parent folder header containing submenu items." },
      { name: "Status", type: "bool", pk: false, fk: false, nullable: false, description: "Active or inactive state." },
      { name: "ParentMenuId", type: "int", pk: false, fk: true, nullable: true, description: "Foreign key self-referencing to parent Menu record (recursive)." }
    ],
    relations: [
      { target: "Menu", type: "many-to-one", field: "ParentMenuId", description: "Parent menu item (Self-Reference)" },
      { target: "Menu", type: "one-to-many", field: "Id", description: "Sub-menus under this menu group (Self-Reference)" },
      { target: "MenuPermission", type: "one-to-many", field: "MenuId", description: "Security constraints for role access" }
    ]
  },
  {
    name: "MenuPermission",
    description: "Junction table mapping Roles to Menus and defining direct CRUD and dashboard permissions.",
    columns: [
      { name: "Id", type: "int", pk: true, fk: false, nullable: false, description: "Primary Key identity increment column." },
      { name: "MenuId", type: "int", pk: false, fk: true, nullable: false, description: "Foreign key referencing direct Menu item." },
      { name: "RoleId", type: "int", pk: false, fk: true, nullable: false, description: "Foreign key referencing direct Role profile." },
      { name: "CanView", type: "bool", pk: false, fk: false, nullable: false, description: "Permission flag showing if the role can view/read this menu page." },
      { name: "CanAdd", type: "bool", pk: false, fk: false, nullable: false, description: "Permission flag showing if the role can create records." },
      { name: "CanEdit", type: "bool", pk: false, fk: false, nullable: false, description: "Permission flag showing if the role can modify records." },
      { name: "CanDelete", type: "bool", pk: false, fk: false, nullable: false, description: "Permission flag showing if the role can delete records." },
      { name: "ShowInHome", type: "bool", pk: false, fk: false, nullable: false, description: "Flags if the link should appear as a quick shortcut card on home landing page." }
    ],
    relations: [
      { target: "Menu", type: "many-to-one", field: "MenuId", description: "Navigated page menu target" },
      { target: "Role", type: "many-to-one", field: "RoleId", description: "Assigned security role context" }
    ]
  },
  {
    name: "UserLog",
    description: "Auditing log table recording login timestamps, activities, alerts, and system level logs.",
    columns: [
      { name: "LogId", type: "int", pk: true, fk: false, nullable: false, description: "Primary Key identity increment column." },
      { name: "UserId", type: "int", pk: false, fk: true, nullable: false, description: "Foreign Key referencing the User that executed the action." },
      { name: "LogLevel", type: "string", pk: false, fk: false, nullable: true, description: "Log severity level (Info, Warning, Error, Critical)." },
      { name: "LogMessage", type: "string", pk: false, fk: false, nullable: true, description: "Detailed log description text." },
      { name: "Timestamp", type: "DateTime", pk: false, fk: false, nullable: false, description: "Timestamp of log occurrence (defaults to server date)." }
    ],
    relations: [
      { target: "Users", type: "many-to-one", field: "UserId", description: "Direct author user who created the event" }
    ]
  },
  {
    name: "Customer",
    description: "Client/customer data associated with operating branches. Holds demographic and security portal credentials.",
    columns: [
      { name: "Id", type: "int", pk: true, fk: false, nullable: false, description: "Primary Key identity increment column." },
      { name: "Code", type: "string", pk: false, fk: false, nullable: false, description: "Unique customer customer code sequence." },
      { name: "Number", type: "int", pk: false, fk: false, nullable: false, description: "Sequential integer customer indexing." },
      { name: "Name", type: "string", pk: false, fk: false, nullable: false, description: "Customer full name." },
      { name: "Address1", type: "string", pk: false, fk: false, nullable: false, description: "Primary residential/office street address." },
      { name: "Address2", type: "string", pk: false, fk: false, nullable: false, description: "Secondary address line." },
      { name: "City", type: "string", pk: false, fk: false, nullable: false, description: "Address city." },
      { name: "District", type: "int", pk: false, fk: false, nullable: false, description: "District ID code." },
      { name: "DistrictName", type: "string", pk: false, fk: false, nullable: false, description: "District display name." },
      { name: "State", type: "int", pk: false, fk: false, nullable: false, description: "State ID code." },
      { name: "StateName", type: "string", pk: false, fk: false, nullable: false, description: "State display name." },
      { name: "Pincode", type: "int", pk: false, fk: false, nullable: false, description: "Mailing ZIP or PIN code." },
      { name: "LandMark", type: "string", pk: false, fk: false, nullable: false, description: "Landmark description for shipping." },
      { name: "Phone", type: "string", pk: false, fk: false, nullable: false, description: "Primary contact phone number." },
      { name: "Phone2", type: "string", pk: false, fk: false, nullable: false, description: "Secondary backup phone number." },
      { name: "Email", type: "string", pk: false, fk: false, nullable: false, description: "Customer email contact." },
      { name: "GstNumber", type: "string", pk: false, fk: false, nullable: false, description: "GST tax registration number." },
      { name: "Image", type: "string", pk: false, fk: false, nullable: true, description: "Profile photo url or file path." },
      { name: "UserName", type: "string", pk: false, fk: false, nullable: false, description: "Customer portal login username." },
      { name: "Password", type: "string", pk: false, fk: false, nullable: false, description: "Secure portal hashed password." },
      { name: "IsAuth2", type: "bool", pk: false, fk: false, nullable: false, description: "Double authentication validation flag." },
      { name: "BranchId", type: "int", pk: false, fk: true, nullable: false, description: "Foreign key referencing the managing Branch." },
      { name: "FcmToken", type: "string", pk: false, fk: false, nullable: false, description: "Notification token." }
    ],
    relations: [
      { target: "Branch", type: "many-to-one", field: "BranchId", description: "Direct managing Branch location" }
    ]
  }
];

const MERMAID_SOURCE = `
erDiagram
    Company ||--o{ Branch : ""
    Company ||--o{ Users : ""
    Role ||--o{ Users : ""
    Users ||--o{ UserBranch : ""
    Branch ||--o{ UserBranch : ""
    Users ||--o{ UserLog : ""
    Branch ||--o{ Customer : ""
    Role ||--o{ MenuPermission : ""
    Menu ||--o{ MenuPermission : ""
    Menu ||--o{ Menu : ""
`;

const SchemaErd = () => {
  const { user } = useSelector((state) => state.auth || {});
  const { theme } = useSelector((state) => state.theme || {});
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';

  const [libsLoaded, setLibsLoaded] = useState(false);
  const [libError, setLibError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [columnQuery, setColumnQuery] = useState('');
  const [selectedEntityName, setSelectedEntityName] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('columns');
  
  // Toast Alert Notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToastAlert, setShowToastAlert] = useState(false);

  const mermaidRef = useRef(null);
  const panZoomRef = useRef(null);

  // Show a standard custom toast message
  const showToast = (msg) => {
    setToastMessage(msg);
    setShowToastAlert(true);
    setTimeout(() => setShowToastAlert(false), 2500);
  };

  // Utility to load external scripts dynamically
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // Load Mermaid.js and svg-pan-zoom dynamically from CDN on mount
  useEffect(() => {
    const loadLibs = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js');
        
        if (window.mermaid) {
          setLibsLoaded(true);
        } else {
          throw new Error('Mermaid library not loaded on window context');
        }
      } catch (err) {
        console.error('Failed to load visual schema scripts:', err);
        setLibError('Failed to load libraries. Please check your internet connection.');
      }
    };
    loadLibs();
  }, []);

  // Re-render Mermaid graph when libs are loaded OR when active theme changes
  useEffect(() => {
    if (libsLoaded && !libError) {
      renderDiagram();
    }
    return () => {
      if (panZoomRef.current) {
        panZoomRef.current.destroy();
        panZoomRef.current = null;
      }
    };
  }, [libsLoaded, theme, libError]);

  // Main rendering method for Mermaid graph
  const renderDiagram = async () => {
    if (!window.mermaid || !mermaidRef.current) return;
    try {
      mermaidRef.current.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:var(--text-muted);">
          <span style="font-size: 0.9rem; font-weight: 500;">Rendering database entity relationships...</span>
        </div>`;

      const isDark = theme === 'dark';
      window.mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        er: {
          useMaxWidth: false,
          layoutDirection: 'LR'
        }
      });

      const { svg } = await window.mermaid.render('rendered-svg-diagram', MERMAID_SOURCE);
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = svg;
        const svgElement = mermaidRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.setAttribute('id', 'erd-svg-element');
          svgElement.style.width = '100%';
          svgElement.style.height = '100%';

          // Apply event listeners on text nodes inside the rendered SVG
          bindSvgInteractions(svgElement);

          // Initialize panning & zooming on SVG
          if (window.svgPanZoom) {
            if (panZoomRef.current) {
              panZoomRef.current.destroy();
            }
            panZoomRef.current = window.svgPanZoom(svgElement, {
              zoomEnabled: true,
              controlIconsEnabled: false,
              fit: true,
              center: true,
              minZoom: 0.1,
              maxZoom: 10,
              zoomScaleSensitivity: 0.15
            });

            // Adjust sizing alignment
            setTimeout(() => {
              if (panZoomRef.current) {
                panZoomRef.current.resize();
                panZoomRef.current.fit();
                panZoomRef.current.center();
              }
            }, 100);
          }
        }
      }
    } catch (err) {
      console.error(err);
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `
          <div style="color:var(--danger); padding:2rem; text-align:center;">
            <p>Error rendering database diagram: Invalid syntax or rendering issue.</p>
          </div>`;
      }
    }
  };

  // Bind click listeners on entity blocks within SVG
  const bindSvgInteractions = (svgElement) => {
    const texts = svgElement.querySelectorAll('text');
    texts.forEach(textNode => {
      const textContent = textNode.textContent.trim();
      const matchedEntity = ENTITIES.find(e => e.name.toLowerCase() === textContent.toLowerCase());
      
      if (matchedEntity) {
        let parentGroup = textNode.parentNode;
        while (parentGroup && parentGroup.tagName !== 'g' && parentGroup !== svgElement) {
          parentGroup = parentGroup.parentNode;
        }

        if (parentGroup) {
          parentGroup.style.cursor = 'pointer';
          parentGroup.addEventListener('click', (event) => {
            event.stopPropagation();
            selectEntity(matchedEntity.name);
          });
        }
      }
    });
  };

  // Handle active highlighting and panning inside SVG
  const highlightSvgNode = (entityName) => {
    const svgElement = document.getElementById('erd-svg-element');
    if (!svgElement) return;

    // Reset previous highlights
    const previousHighlights = svgElement.querySelectorAll('.glowing-highlight');
    previousHighlights.forEach(el => {
      el.classList.remove('glowing-highlight');
      const rects = el.querySelectorAll('rect');
      rects.forEach(r => {
        r.style.stroke = '';
        r.style.strokeWidth = '';
      });
    });

    const texts = svgElement.querySelectorAll('text');
    let targetGroup = null;
    
    texts.forEach(textNode => {
      if (textNode.textContent.trim().toLowerCase() === entityName.toLowerCase()) {
        let parentGroup = textNode.parentNode;
        while (parentGroup && parentGroup.tagName !== 'g' && parentGroup !== svgElement) {
          parentGroup = parentGroup.parentNode;
        }
        if (parentGroup) {
          targetGroup = parentGroup;
        }
      }
    });

    if (targetGroup) {
      targetGroup.classList.add('glowing-highlight');
      const rects = targetGroup.querySelectorAll('rect');
      rects.forEach(r => {
        r.style.stroke = 'var(--primary)';
        r.style.strokeWidth = '3px';
      });

      // Pan to center the selected group element
      if (panZoomRef.current) {
        const bounding = targetGroup.getBoundingClientRect();
        const container = document.getElementById('diagram-container');
        if (container) {
          const containerBounding = container.getBoundingClientRect();
          
          const groupX = bounding.left - containerBounding.left + (bounding.width / 2);
          const groupY = bounding.top - containerBounding.top + (bounding.height / 2);
          
          const centerPointX = containerBounding.width / 2;
          const centerPointY = containerBounding.height / 2;

          const deltaX = centerPointX - groupX;
          const deltaY = centerPointY - groupY;
          
          panZoomRef.current.panBy({ x: deltaX, y: deltaY });
        }
      }
    }
  };

  // Select an entity and pop-up details drawer
  const selectEntity = (entityName) => {
    setSelectedEntityName(entityName);
    setPanelOpen(true);
    // Apply highlight in SVG
    highlightSvgNode(entityName);
  };

  // Zoom control triggers
  const handleZoomIn = () => {
    if (panZoomRef.current) panZoomRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (panZoomRef.current) panZoomRef.current.zoomOut();
  };

  const handleZoomReset = () => {
    if (panZoomRef.current) {
      panZoomRef.current.resetZoom();
      panZoomRef.current.center();
    }
  };

  const handleZoomFit = () => {
    if (panZoomRef.current) {
      panZoomRef.current.fit();
      panZoomRef.current.center();
    }
  };

  // Export current SVG rendering to local download
  const handleExportSvg = () => {
    const svgElement = document.getElementById('erd-svg-element');
    if (!svgElement) return;

    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'api-database-schema.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);

      showToast('Diagram exported as SVG successfully!');
    } catch (err) {
      console.warn('Failed to export diagram SVG:', err);
      showToast('Export failed. Diagram not loaded completely.');
    }
  };

  // Code Generation Helpers
  const generateDDL = (entity) => {
    let ddl = `CREATE TABLE [dbo].[${entity.name}] (\n`;
    let colLines = [];
    
    entity.columns.forEach(col => {
      let typeStr = "";
      if (col.type === "int") {
        typeStr = "INT";
      } else if (col.type === "string") {
        typeStr = "NVARCHAR(255)";
      } else if (col.type === "DateTime") {
        typeStr = "DATETIME2";
      } else if (col.type === "bool") {
        typeStr = "BIT";
      } else {
        typeStr = col.type.toUpperCase();
      }
      
      let constraints = [];
      if (col.pk && entity.name !== "UserBranch") { 
        constraints.push("IDENTITY(1,1)");
      }
      if (!col.nullable) {
        constraints.push("NOT NULL");
      } else {
        constraints.push("NULL");
      }
      
      colLines.push(`    [${col.name}] ${typeStr} ${constraints.join(' ')}`);
    });

    // Primary Key constraint
    if (entity.name === "UserBranch") {
      colLines.push(`    CONSTRAINT [PK_UserBranch] PRIMARY KEY CLUSTERED ([UserId] ASC, [BranchId] ASC)`);
    } else {
      const pkCol = entity.columns.find(c => c.pk);
      if (pkCol) {
        colLines.push(`    CONSTRAINT [PK_${entity.name}] PRIMARY KEY CLUSTERED ([${pkCol.name}] ASC)`);
      }
    }
    
    // Add Foreign Keys constraints
    entity.columns.forEach(col => {
      if (col.fk) {
        let refTable = "";
        if (col.name === "CompanyId") refTable = "Company";
        else if (col.name === "BranchId") refTable = "Branch";
        else if (col.name === "UserId") refTable = "Users";
        else if (col.name === "RoleId") refTable = "Role";
        else if (col.name === "ParentMenuId") refTable = "Menu";
        else if (col.name === "MenuId") refTable = "Menu";
        
        if (refTable) {
          colLines.push(`    CONSTRAINT [FK_${entity.name}_${refTable}_${col.name}] FOREIGN KEY ([${col.name}]) REFERENCES [dbo].[${refTable}] ([Id])`);
        }
      }
    });
    
    ddl += colLines.join(",\n");
    ddl += `\n);`;
    return ddl;
  };

  const generateCSharpClass = (entity) => {
    let code = `using System;\nusing System.Collections.Generic;\nusing System.ComponentModel.DataAnnotations;\nusing System.ComponentModel.DataAnnotations.Schema;\n\nnamespace Models\n{\n`;
    code += `    public class ${entity.name}\n    {\n`;
    
    entity.columns.forEach(col => {
      if (col.pk) {
        code += `        [Key]\n`;
      }
      if (!col.nullable && col.type === "string") {
        code += `        [Required]\n`;
      }
      
      let csharpType = col.type;
      if (col.type === "DateTime") csharpType = "DateTime";
      if (col.type === "bool") csharpType = "bool";
      
      let defaultVal = "";
      if (col.type === "string") {
        if (col.nullable) {
          csharpType = "string?";
        } else {
          csharpType = "string";
          defaultVal = " = null!;";
        }
      } else if (col.nullable) {
        csharpType += "?";
      }
      
      code += `        public ${csharpType} ${col.name} { get; set; }${defaultVal}\n\n`;
    });
    
    entity.relations.forEach(rel => {
      if (rel.type === "many-to-one") {
        let navType = rel.target === "Users" ? "Users" : rel.target;
        code += `        [ForeignKey(nameof(${rel.field}))]\n`;
        code += `        public ${navType}? ${rel.target} { get; set; }\n\n`;
      } else if (rel.type === "one-to-many") {
        let collType = rel.target;
        if (rel.target === "Menu" && entity.name === "Menu") {
          code += `        public List<Menu>? ChildMenus { get; set; }\n\n`;
        } else if (rel.target === "UserBranch") {
          code += `        public ICollection<UserBranch> UserBranches { get; set; } = new List<UserBranch>();\n\n`;
        } else {
          code += `        public ICollection<${collType}> ${collType} { get; set; } = new List<${collType}>();\n\n`;
        }
      }
    });
    
    code += `    }\n}`;
    return code;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  // Filter entities list from search input
  const filteredEntities = ENTITIES.filter(entity => {
    const matchesName = entity.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColumns = entity.columns.some(col => 
      col.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesName || matchesColumns;
  });

  const selectedEntity = ENTITIES.find(e => e.name === selectedEntityName);

  // If user is not admin, show premium access denied page (matches ApiDoc)
  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div className="glass-panel" style={{
          maxWidth: '500px',
          padding: '2.5rem 2rem',
          borderRadius: '16px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          background: 'var(--bg-card)',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
          }}>
            <ShieldAlert size={32} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Access Denied
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            This resource contains system database schemas and entity layouts. Access is restricted to system administrators only.
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: '0.6rem 2rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Filter columns inside selected entity details
  const filteredColumns = selectedEntity
    ? selectedEntity.columns.filter(col =>
        col.name.toLowerCase().includes(columnQuery.toLowerCase()) ||
        col.type.toLowerCase().includes(columnQuery.toLowerCase())
      )
    : [];

  return (
    <div className="erd-page-container">
      {/* Sidebar List */}
      <aside className="erd-sidebar">
        <div className="erd-sidebar-search">
          <div className="erd-search-wrapper">
            <Search className="erd-search-icon" size={16} />
            <input
              type="text"
              className="erd-search-input"
              placeholder="Search tables or columns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="erd-sidebar-list">
          <div className="erd-list-header">Database Tables ({ENTITIES.length})</div>
          {filteredEntities.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center' }}>
              No tables found
            </div>
          ) : (
            filteredEntities.map((entity) => (
              <div
                key={entity.name}
                className={`erd-entity-item ${selectedEntityName === entity.name ? 'active' : ''}`}
                onClick={() => selectEntity(entity.name)}
              >
                <div className="erd-entity-header">
                  <span className="erd-entity-name">{entity.name}</span>
                  <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    {entity.columns.length} fields
                  </span>
                </div>
                <span className="erd-entity-desc">{entity.description}</span>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Viewport Area */}
      <main className="erd-canvas-area">
        {/* Graph zoom toolbar */}
        <div className="erd-toolbar">
          <button className="erd-toolbar-btn" onClick={handleZoomIn} title="Zoom In">
            <Plus size={16} />
          </button>
          <button className="erd-toolbar-btn" onClick={handleZoomOut} title="Zoom Out">
            <Minus size={16} />
          </button>
          <button className="erd-toolbar-btn" onClick={handleZoomReset} title="Reset Pan / Zoom">
            <Expand size={16} />
          </button>
          <button className="erd-toolbar-btn" onClick={handleZoomFit} title="Fit to Viewport">
            <Maximize size={16} style={{ transform: 'rotate(45deg)' }} />
          </button>
          <div style={{ width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
          <button className="erd-toolbar-btn" onClick={handleExportSvg} title="Export as SVG" style={{ color: 'var(--primary)' }}>
            <Download size={16} />
          </button>
        </div>

        <div className="erd-viewport" id="diagram-container">
          {libError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--danger)', padding: '2rem' }}>
              <ShieldAlert size={32} />
              <span style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>{libError}</span>
            </div>
          ) : (
            <div className="erd-mermaid-root" ref={mermaidRef} id="mermaid-root" />
          )}
        </div>
      </main>

      {/* Slide-out Detail Panel Drawer */}
      <section className={`erd-detail-panel ${panelOpen ? 'open' : ''}`}>
        {selectedEntity ? (
          <>
            <div className="erd-panel-header">
              <div className="erd-panel-title-area">
                <h2>{selectedEntity.name}</h2>
                <p>{selectedEntity.description}</p>
              </div>
              <button
                className="erd-panel-close-btn"
                onClick={() => setPanelOpen(false)}
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="erd-panel-tabs">
              <button
                className={`erd-panel-tab-btn ${activeTab === 'columns' ? 'active' : ''}`}
                onClick={() => setActiveTab('columns')}
              >
                Columns
              </button>
              <button
                className={`erd-panel-tab-btn ${activeTab === 'relations' ? 'active' : ''}`}
                onClick={() => setActiveTab('relations')}
              >
                Relations
              </button>
              <button
                className={`erd-panel-tab-btn ${activeTab === 'sql' ? 'active' : ''}`}
                onClick={() => setActiveTab('sql')}
              >
                SQL DDL
              </button>
              <button
                className={`erd-panel-tab-btn ${activeTab === 'csharp' ? 'active' : ''}`}
                onClick={() => setActiveTab('csharp')}
              >
                C# Model
              </button>
            </nav>

            <div className="erd-panel-body">
              {/* Columns list tab */}
              {activeTab === 'columns' && (
                <div>
                  <div className="erd-columns-search">
                    <div className="erd-search-wrapper">
                      <Search className="erd-search-icon" size={14} />
                      <input
                        type="text"
                        className="erd-search-input"
                        placeholder="Search fields..."
                        value={columnQuery}
                        onChange={(e) => setColumnQuery(e.target.value)}
                        style={{ padding: '0.35rem 0.35rem 0.35rem 2rem', fontSize: '0.78rem' }}
                      />
                    </div>
                  </div>
                  <div className="erd-columns-table-wrapper">
                    <table className="erd-columns-table">
                      <thead>
                        <tr>
                          <th style={{ width: '32px' }}></th>
                          <th>Field</th>
                          <th>Type</th>
                          <th>Null</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredColumns.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                              No fields match search
                            </td>
                          </tr>
                        ) : (
                          filteredColumns.map((col) => {
                            let badgeClass = '';
                            let badgeText = '';
                            if (col.pk && col.fk) {
                              badgeClass = 'erd-key-both';
                              badgeText = 'PK';
                            } else if (col.pk) {
                              badgeClass = 'erd-key-pk';
                              badgeText = 'PK';
                            } else if (col.fk) {
                              badgeClass = 'erd-key-fk';
                              badgeText = 'FK';
                            }

                            return (
                              <tr key={col.name}>
                                <td>
                                  <div className="erd-key-badge-wrapper">
                                    {badgeText && (
                                      <div className={`erd-key-badge ${badgeClass}`} title={col.pk && col.fk ? 'Primary & Foreign Key' : col.pk ? 'Primary Key' : 'Foreign Key'}>
                                        {badgeText}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="erd-col-name" title={col.description}>{col.name}</div>
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{col.description}</div>
                                </td>
                                <td>
                                  <span className="erd-col-type">{col.type}</span>
                                </td>
                                <td>
                                  <span className={`erd-col-null ${col.nullable ? 'erd-text-nullable' : 'erd-text-req'}`}>
                                    {col.nullable ? 'YES' : 'NO'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Connected relationships tab */}
              {activeTab === 'relations' && (
                <div>
                  <div className="erd-relations-header">Connected Mappings</div>
                  <div className="erd-relations-list">
                    {selectedEntity.relations && selectedEntity.relations.length > 0 ? (
                      selectedEntity.relations.map((rel, idx) => (
                        <div
                          key={idx}
                          className="erd-relation-card"
                          onClick={() => selectEntity(rel.target)}
                        >
                          <div className="erd-relation-info">
                            <span className="erd-relation-target">
                              <Database size={13} style={{ color: 'var(--primary)' }} />
                              {rel.target}
                            </span>
                            <span className="erd-relation-desc">
                              {rel.description} ({rel.field})
                            </span>
                          </div>
                          <span className="erd-relation-type">{rel.type}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', padding: '1rem', textAlign: 'center' }}>
                        No mapped relationships
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Generated SQL DDL tab */}
              {activeTab === 'sql' && (
                <div>
                  <div className="erd-code-wrapper">
                    <div className="erd-code-header">
                      <span className="erd-code-lang">tsql</span>
                      <button
                        className="erd-copy-btn"
                        onClick={() => copyToClipboard(generateDDL(selectedEntity))}
                      >
                        <Clipboard size={13} />
                        Copy Code
                      </button>
                    </div>
                    <pre className="erd-code-block">
                      <code>{generateDDL(selectedEntity)}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Generated C# EF Core Model tab */}
              {activeTab === 'csharp' && (
                <div>
                  <div className="erd-code-wrapper">
                    <div className="erd-code-header">
                      <span className="erd-code-lang">csharp</span>
                      <button
                        className="erd-copy-btn"
                        onClick={() => copyToClipboard(generateCSharpClass(selectedEntity))}
                      >
                        <Clipboard size={13} />
                        Copy Code
                      </button>
                    </div>
                    <pre className="erd-code-block">
                      <code>{generateCSharpClass(selectedEntity)}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Select a table to view details
          </div>
        )}
      </section>

      {/* Floating Success Notification Toast */}
      <div className={`erd-toast ${showToastAlert ? 'show' : ''}`}>
        <CheckCircle size={15} />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};

export default SchemaErd;
