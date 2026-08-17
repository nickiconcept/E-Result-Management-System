import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (Pages 2+)
        if self._pageNumber > 1:
            self.drawString(45, 755, "Jere Model Academy — School Management System (SMS) Capability Summary")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(45, 747, 567, 747)
            
        # Footer (All pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(45, 40, 567, 40)
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(567, 28, page_text)
        self.drawString(45, 28, "Jere Model Academy SMS | Executive Client Feature Summary")
        self.restoreState()

def build_pdf(filename="Jere_Model_Academy_SMS_Feature_Summary.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()

    # Define color palette
    c_primary = colors.HexColor("#1E3A8A")      # Navy Blue
    c_secondary = colors.HexColor("#2563EB")    # Bright Royal Blue
    c_dark = colors.HexColor("#1F2937")         # Dark Charcoal Text
    c_light_bg = colors.HexColor("#F8FAFC")     # Soft Off-white
    c_card_bg = colors.HexColor("#EFF6FF")      # Light Blue Tint
    c_border = colors.HexColor("#CBD5E1")       # Border Grey

    # Custom Paragraph Styles
    styles.add(ParagraphStyle(
        name='DocTitle',
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=c_primary,
        spaceAfter=4
    ))

    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='SubSectionHeader',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=c_secondary,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    ))

    styles.add(ParagraphStyle(
        name='BodyCustom',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_dark,
        spaceAfter=4
    ))

    styles.add(ParagraphStyle(
        name='BulletCustom',
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=c_dark,
        leftIndent=10,
        spaceAfter=3
    ))

    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11.5,
        textColor=colors.white,
        alignment=0
    ))

    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=c_dark
    ))

    styles.add(ParagraphStyle(
        name='TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=c_primary
    ))

    styles.add(ParagraphStyle(
        name='CalloutText',
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=c_primary
    ))

    story = []

    # --- HEADER / BANNER ---
    banner_data = [
        [
            Paragraph("<b>JERE MODEL ACADEMY</b><br/><font size=9.5 color='#64748B'>SCHOOL MANAGEMENT SYSTEM (SMS)</font>", ParagraphStyle('B1', fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=c_primary)),
            Paragraph("<font size=8.5 color='#475569'><b>Executive Client Feature Summary</b><br/>Version 1.0 | Ready for Deployment<br/>Kaduna State, Nigeria</font>", ParagraphStyle('B2', fontName='Helvetica', fontSize=8.5, leading=12, alignment=2, textColor=colors.HexColor("#475569")))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[330, 192])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_light_bg),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 8))

    # --- EXECUTIVE SUMMARY ---
    story.append(Paragraph("Executive Summary", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_secondary, spaceBefore=0, spaceAfter=5))
    
    exec_summary_text = (
        "The <b>Jere Model Academy School Management System (SMS)</b> is a comprehensive, modern, web-based digital portal "
        "engineered to streamline school administration, automate academic assessment workflows, manage fee collections, "
        "and provide seamless communication channels for Administrators, Teachers, Students, and Parents. "
        "Designed to support Nursery, Primary, Junior Secondary (JSS), and Senior Secondary (SSS) tiers, the system offers an "
        "intuitive user experience paired with robust security, digital result protection, and rich analytics."
    )
    story.append(Paragraph(exec_summary_text, styles['BodyCustom']))
    story.append(Spacer(1, 6))

    # --- CORE USER PORTALS (TABLE) ---
    story.append(Paragraph("System Architecture & Role-Based Portals", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_secondary, spaceBefore=0, spaceAfter=5))

    portals_data = [
        [
            Paragraph("User Role", styles['TableHeader']),
            Paragraph("Primary Responsibilities & Access Level", styles['TableHeader']),
            Paragraph("Key Portal Features", styles['TableHeader'])
        ],
        [
            Paragraph("<b>System Administrator</b>", styles['TableCellBold']),
            Paragraph("Full operational governance, school configuration, user account management, and financial control.", styles['TableCell']),
            Paragraph("• Student & Staff Directory<br/>• Fee Structure & Payment Tracking<br/>• Result PIN Generation<br/>• Broad-Sheet & Report Card Audits<br/>• Session & Term Management<br/>• System Settings & Branding", styles['TableCell'])
        ],
        [
            Paragraph("<b>Teacher / Form Master</b>", styles['TableCellBold']),
            Paragraph("Class-level academic management, score entry, attendance tracking, and behavioral evaluation.", styles['TableCell']),
            Paragraph("• CA & Exam Score Entry<br/>• Class Attendance Marking<br/>• Form Teacher Remarks<br/>• Affective & Psychomotor Evaluation<br/>• Class Broadsheets View<br/>• Scheme of Work Publishing", styles['TableCell'])
        ],
        [
            Paragraph("<b>Student / Parent</b>", styles['TableCellBold']),
            Paragraph("Personal academic portal for checking termly results, tracking payments, and accessing curriculum.", styles['TableCell']),
            Paragraph("• Secure Result Checking (PIN)<br/>• Downloadable Report Cards<br/>• School Fee Statements & Receipts<br/>• Interactive Scheme of Work<br/>• School Rules & Digital Undertakings", styles['TableCell'])
        ]
    ]

    portals_table = Table(portals_data, colWidths=[115, 185, 222], repeatRows=1)
    portals_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 5),
        ('BACKGROUND', (0,1), (-1,1), colors.white),
        ('BACKGROUND', (0,2), (-1,2), c_light_bg),
        ('BACKGROUND', (0,3), (-1,3), colors.white),
    ]))
    story.append(portals_table)
    story.append(Spacer(1, 10))

    # --- DETAILED FUNCTIONAL CAPABILITIES ---
    story.append(Paragraph("Key System Functional Modules", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_secondary, spaceBefore=0, spaceAfter=5))

    modules = [
        ("1. Student Information System (SIS) & Admission Management", [
            "<b>Comprehensive Profiles:</b> Stores complete student records including Admission Numbers, Date of Birth, Gender, State of Origin, LGA, Residential Address, and Passport Photographs.",
            "<b>Parent & Guardian Integration:</b> Keeps emergency contact information, parent phone numbers, and home address details.",
            "<b>Special Needs & Health Tracking:</b> Dedicated fields for physical handicaps or special care requirements.",
            "<b>Academic Class Assignment:</b> Flexible placement across Nursery, Primary, JSS, and SSS classes and arms.",
            "<b>Student Promotion & Archiving:</b> Smooth session-to-session class promotion and record status management (Active, Suspended, Archived)."
        ]),
        ("2. Academic Assessment & Examination Engine", [
            "<b>Flexible CA & Exam Weightings:</b> Fully customizable score structures (CA1, CA2, CA3, CA4, and Termly Exams) tailored per school specification.",
            "<b>Automated Score Calculation:</b> Real-time aggregation of continuous assessments and exams with automatic total calculations and grade assignment (A, B, C, D, E, F).",
            "<b>Affective & Psychomotor Evaluation:</b> 5-point rating scales for behavioral traits (Honesty, Punctuality, Neatness, Leadership) and practical skills (Sports, Crafts, Handwriting).",
            "<b>Form Teacher & Principal Remarks:</b> Integrated comment engine providing personalized qualitative feedback on every student's report card.",
            "<b>Class Broadsheets:</b> Complete master broadsheets displaying subject performance side-by-side for an entire class for academic review."
        ]),
        ("3. Official Report Cards & Bulk Printing", [
            "<b>Digital Report Cards:</b> Clean, printable report card documents containing school branding, logo, principal signature, position in class, class average, attendance summary, and term resumption dates.",
            "<b>One-Click Bulk Result Printer:</b> Allows administrators to generate and print report cards for an entire class simultaneously, saving hours of manual administrative work.",
            "<b>Digital Signature Integration:</b> Electronic signature capture and rendering for Teachers and Principals to authenticate issued report cards."
        ]),
        ("4. Scratch Card Style Result PIN Security System", [
            "<b>Anti-Tamper Result Checking:</b> Unique 12-character alphanumeric PIN codes generated specifically for each student and term.",
            "<b>Usage Limit Controls:</b> Built-in limit enforcement (e.g. maximum 5 checks per PIN) preventing unauthorized distribution or misuse.",
            "<b>Financial Control:</b> Result PINs can be issued upon fee clearance, ensuring parents fulfill financial obligations before retrieving report cards."
        ]),
        ("5. School Fee Management & Digital Receipting", [
            "<b>Tiered Fee Structures:</b> Custom fee items defined by school tier (Nursery, Primary, JSS, SSS) covering School, Books, Uniforms, and Development levies.",
            "<b>Student Financial Ledgers:</b> Automatic tracking of Amount Due, Total Paid, and Outstanding Balance per student.",
            "<b>Multiple Payment Log Types:</b> Supports Cash, Bank Transfer, and POS transactions logged by bursars/administrators.",
            "<b>Official Digital Receipts:</b> Instant generation of unique receipt numbers and printable payment proof for parents."
        ]),
        ("6. Attendance Tracking Module", [
            "<b>Daily Attendance Registers:</b> Teachers can mark student status (Present, Absent, Late) in seconds.",
            "<b>Report Card Integration:</b> Total days present and total days school opened automatically calculate and reflect on final report cards."
        ]),
        ("7. Scheme of Work & Academic Curriculum Delivery", [
            "<b>Weekly Curriculum Publishing:</b> Teachers post weekly topics, subtitles, and learning objectives for each subject and class.",
            "<b>Student Portal Access:</b> Students and parents can preview upcoming topics, helping learners prepare ahead of physical classes."
        ]),
        ("8. School Rules & Parent Undertaking Compliance", [
            "<b>Digital Policy Access:</b> Direct access to school code of conduct, dress codes, and academic requirements.",
            "<b>Parent Digital Undertaking:</b> Online agreement verification tracking signed parent acknowledgments for student compliance."
        ])
    ]

    for title, points in modules:
        block_items = []
        block_items.append(Paragraph(title, styles['SubSectionHeader']))
        for pt in points:
            block_items.append(Paragraph(f"• {pt}", styles['BulletCustom']))
        block_items.append(Spacer(1, 2))
        story.append(KeepTogether(block_items))

    story.append(Spacer(1, 6))

    # --- TECHNICAL SPECIFICATIONS & VALUE PROPOSITION ---
    story.append(Paragraph("Technical Architecture & Deployment Highlights", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_secondary, spaceBefore=0, spaceAfter=5))

    tech_spec_data = [
        [
            Paragraph("<b>Frontend Framework:</b> React 19 + Vite (Modern Single Page App)", styles['TableCell']),
            Paragraph("<b>Backend Engine:</b> Node.js + Express REST API", styles['TableCell'])
        ],
        [
            Paragraph("<b>Database Layer:</b> Dual Engine (SQLite / MySQL Connection Pool)", styles['TableCell']),
            Paragraph("<b>Security & Auth:</b> JWT Session Tokens + Bcrypt Password Hashing", styles['TableCell'])
        ],
        [
            Paragraph("<b>User Interface:</b> Glassmorphism Design + Dark/Light Theme", styles['TableCell']),
            Paragraph("<b>Deployability:</b> Zero-dependency portable runtime, Docker ready", styles['TableCell'])
        ]
    ]

    tech_table = Table(tech_spec_data, colWidths=[261, 261])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
        ('BOX', (0,0), (-1,-1), 1, c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 5.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 10))

    # --- CLIENT VALUE PROPOSITION ---
    val_block = []
    val_block.append(Paragraph("Value Proposition for Stakeholders", styles['SectionHeader']))
    val_block.append(HRFlowable(width="100%", thickness=1.5, color=c_secondary, spaceBefore=0, spaceAfter=5))

    val_data = [
        [
            Paragraph("Stakeholder", styles['TableHeader']),
            Paragraph("Key Business & Operational Benefits", styles['TableHeader'])
        ],
        [
            Paragraph("<b>School Management & Proprietors</b>", styles['TableCellBold']),
            Paragraph("• Complete administrative control over all academic & financial operations.<br/>• Accelerated fee collection through Result PIN access control.<br/>• Eliminates paper loss and manual report card calculation errors.<br/>• Custom branding tailored to Jere Model Academy's identity.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Teachers & Educators</b>", styles['TableCellBold']),
            Paragraph("• Reduces report card preparation time by over 80%.<br/>• Automatic total and grade computation prevents human calculation mistakes.<br/>• Easy digital attendance marking and scheme of work delivery.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Parents & Students</b>", styles['TableCellBold']),
            Paragraph("• Instant online result access from any smartphone or computer.<br/>• Transparent payment records and official downloadable receipts.<br/>• Clear visibility into weekly curriculum and child's behavioral ratings.", styles['TableCell'])
        ]
    ]

    val_table = Table(val_data, colWidths=[150, 372], repeatRows=1)
    val_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 5),
        ('BACKGROUND', (0,1), (-1,1), colors.white),
        ('BACKGROUND', (0,2), (-1,2), c_light_bg),
        ('BACKGROUND', (0,3), (-1,3), colors.white),
    ]))
    val_block.append(val_table)
    val_block.append(Spacer(1, 10))

    # --- CALLOUT / SIGN-OFF ---
    callout_data = [
        [
            Paragraph(
                "<b>Summary Conclusion:</b><br/>"
                "The Jere Model Academy School Management System provides a complete, modern, and reliable digital transformation "
                "solution for school administration. It ensures operational accuracy, robust financial control, and high parent satisfaction. "
                "Ready for immediate deployment and custom school integration.",
                styles['CalloutText']
            )
        ]
    ]
    callout_table = Table(callout_data, colWidths=[522])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_card_bg),
        ('BOX', (0,0), (-1,-1), 1.5, c_primary),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    val_block.append(callout_table)

    story.append(KeepTogether(val_block))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated: {filename}")

if __name__ == '__main__':
    build_pdf()
