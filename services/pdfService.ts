import { jsPDF } from "jspdf";
import { PhotoEntry } from "../types";

export const generatePDF = (entries: PhotoEntry[], projectTitle: string, companyLogo: string | null) => {
  const doc = new jsPDF();
  
  // Dimensions in mm (A4)
  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN_X = 15;
  const MARGIN_BOTTOM = 15;
  
  // Header Config
  const HEADER_HEIGHT = 30; // Reserved space for header
  const HEADER_Y_START = 10;
  const CONTENT_START_Y = HEADER_Y_START + HEADER_HEIGHT + 5; // Start content a bit below header
  
  const CONTENT_HEIGHT = PAGE_HEIGHT - CONTENT_START_Y - MARGIN_BOTTOM;
  const ITEMS_PER_PAGE = 4;
  const ROW_HEIGHT = CONTENT_HEIGHT / ITEMS_PER_PAGE;
  
  // Image Box Config (Left Side)
  // We allocate a box for the image. The image will be centered within this box.
  const IMG_BOX_WIDTH = 80; 
  const IMG_BOX_HEIGHT = ROW_HEIGHT - 10; // 5mm padding top/bottom
  
  // Text Config (Right Side)
  const TEXT_X = MARGIN_X + IMG_BOX_WIDTH + 10;
  const TEXT_WIDTH = PAGE_WIDTH - TEXT_X - MARGIN_X;

  let cursorY = CONTENT_START_Y;

  // Helper to draw header
  const drawHeader = (pageNumber: number) => {
    // 1. Logo
    if (companyLogo) {
      try {
        const logoProps = doc.getImageProperties(companyLogo);
        // Fit logo into a box of e.g., 50mm wide x 25mm high
        const maxLogoW = 50;
        const maxLogoH = 25;
        const logoRatio = logoProps.width / logoProps.height;
        
        let logoW = maxLogoW;
        let logoH = maxLogoW / logoRatio;
        
        if (logoH > maxLogoH) {
            logoH = maxLogoH;
            logoW = maxLogoH * logoRatio;
        }
        
        doc.addImage(companyLogo, "JPEG", MARGIN_X, HEADER_Y_START, logoW, logoH, undefined, 'FAST');
      } catch (e) {
        console.warn("Invalid logo data", e);
      }
    }

    // 2. Project Title
    if (projectTitle) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      // Align title to the right or center? Let's align right for contrast with logo on left, or next to logo.
      // Let's go with Right Aligned for a clean professional look.
      doc.text(projectTitle, PAGE_WIDTH - MARGIN_X, HEADER_Y_START + 15, { align: "right" });
    }

    // 3. Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, HEADER_Y_START + HEADER_HEIGHT, PAGE_WIDTH - MARGIN_X, HEADER_Y_START + HEADER_HEIGHT);
  };

  // Draw header on first page
  drawHeader(1);

  entries.forEach((entry, index) => {
    // Check for new page
    if (index > 0 && index % ITEMS_PER_PAGE === 0) {
      doc.addPage();
      cursorY = CONTENT_START_Y;
      drawHeader(Math.ceil((index + 1) / ITEMS_PER_PAGE));
    }

    const rowTop = cursorY;
    const itemCenterY = rowTop + (ROW_HEIGHT / 2);

    // --- 1. Draw Image (Aspect Ratio Preserved) ---
    if (entry.imageSrc) {
      try {
        const props = doc.getImageProperties(entry.imageSrc);
        const imgRatio = props.width / props.height;
        
        // Calculate dimensions to fit in IMG_BOX
        let renderW = IMG_BOX_WIDTH;
        let renderH = IMG_BOX_WIDTH / imgRatio;

        if (renderH > IMG_BOX_HEIGHT) {
            renderH = IMG_BOX_HEIGHT;
            renderW = IMG_BOX_HEIGHT * imgRatio;
        }

        // Center image in the box
        const xOffset = MARGIN_X + (IMG_BOX_WIDTH - renderW) / 2;
        const yOffset = rowTop + 5 + (IMG_BOX_HEIGHT - renderH) / 2;

        // Use high quality compression (NONE or SLOW) implies less artifacts. 
        // 'FAST' is default. We can omit the alias and compression to use default but ensure sizing is correct.
        doc.addImage(entry.imageSrc, "JPEG", xOffset, yOffset, renderW, renderH);
        
        // Optional: Draw a border around image? 
        // doc.rect(xOffset, yOffset, renderW, renderH);
      } catch (e) {
        console.error("Error drawing image", e);
        doc.setFontSize(10);
        doc.text("[Image Error]", MARGIN_X, rowTop + 20);
      }
    }

    // --- 2. Draw Description ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    // Split text
    const splitText = doc.splitTextToSize(entry.description, TEXT_WIDTH);
    const textHeight = splitText.length * 5; // 5mm approx line height
    
    // Center text vertically in the row
    // We want it aligned with the visual center of the image area or the row itself
    let textY = itemCenterY - (textHeight / 2) + 2; // +2 for baseline adjustment
    
    // Ensure text doesn't overlap top of row
    if (textY < rowTop + 5) textY = rowTop + 5;

    doc.text(splitText, TEXT_X, textY);

    // --- 3. Row Divider (except last on page) ---
    if ((index + 1) % ITEMS_PER_PAGE !== 0 && index !== entries.length - 1) {
       doc.setDrawColor(230, 230, 230);
       doc.setLineWidth(0.2);
       doc.line(MARGIN_X, rowTop + ROW_HEIGHT, PAGE_WIDTH - MARGIN_X, rowTop + ROW_HEIGHT);
    }

    cursorY += ROW_HEIGHT;
  });

  doc.save(`${(projectTitle || "project").replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`);
};