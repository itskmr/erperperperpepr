interface SchoolInfo {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  recognitionId?: string;
  affiliationNo?: string;
}

// Helper function to construct full image URL
export const getFullImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Construct full URL from relative path
  const baseUrl = window.location.origin.replace(':5173', ':5000'); // Frontend to backend port
  return `${baseUrl}/${imagePath}`;
};

// Fetch school information
export const fetchSchoolInfo = async (): Promise<SchoolInfo> => {
  let schoolInfo: SchoolInfo = {
    schoolName: "J.P. International",
    address: "",
    phone: "",
    email: ""
  };

  try {
    const response = await fetch('/api/school/profile');
    if (response.ok) {
      const data = await response.json();
      schoolInfo = {
        schoolName: data.schoolName || "J.P. International",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        logoUrl: data.image_url,
        recognitionId: data.recognitionId || '',
        affiliationNo: data.affiliationNo || ''
      };
    }
  } catch (error) {
    console.warn('Could not fetch school info, using defaults:', error);
  }

  return schoolInfo;
};

// Generate consistent header HTML for printing
export const generateSchoolHeader = (schoolInfo: SchoolInfo, formTitle: string): string => {
  const logoUrl = getFullImageUrl(schoolInfo.logoUrl);

  return `
    <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" alt="School Logo" class="school-logo" />` : ''}
        <div class="school-name">${schoolInfo.schoolName}</div>
        <div class="school-details">
            ${schoolInfo.address ? schoolInfo.address + '<br>' : ''}
            ${schoolInfo.recognitionId ? 'Sr. Sec. Recognized Vide ID No. ' + schoolInfo.recognitionId + ', ' : ''}
            ${schoolInfo.affiliationNo ? 'CBSE Affiliation No. ' + schoolInfo.affiliationNo + '<br>' : ''}
            ${schoolInfo.phone ? 'Contact Nos: ' + schoolInfo.phone : ''} ${schoolInfo.email ? ' | Email: ' + schoolInfo.email : ''}
        </div>
    </div>
    <div class="form-title">${formTitle}</div>
  `;
};

// Common CSS styles for school headers
export const getHeaderStyles = (): string => {
  return `
    .header {
        text-align: center;
        margin-bottom: 18px;
        border-bottom: 2px double #1a237e;
        padding-bottom: 12px;
        position: relative;
    }
    
    .school-logo {
        width: 350px;
        height: 120px;
        margin: 0 auto 8px;
        display: block;
        background: transparent;
    }
    
    .school-name {
        font-size: 22px;
        font-weight: bold;
        color: #1a237e;
        margin-bottom: 4px;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        font-family: 'Georgia', serif;
    }
    
    .school-details {
        font-size: 10px;
        color: #555;
        margin-bottom: 8px;
        line-height: 1.4;
    }
    
    .form-title {
        font-size: 16px;
        font-weight: bold;
        margin: 10px 0;
        text-align: center;
        padding: 8px;
        background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
        color: white;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 2px 4px rgba(26, 35, 126, 0.3);
    }
  `;
};

export type { SchoolInfo }; 