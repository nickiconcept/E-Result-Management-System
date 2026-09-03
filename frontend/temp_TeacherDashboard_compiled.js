import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/TeacherDashboard.jsx");const React = __vite__cjsImport0_react; const useState = __vite__cjsImport0_react["useState"]; const useEffect = __vite__cjsImport0_react["useEffect"];const html2pdf = __vite__cjsImport7_html2pdf_js;const _jsxDEV = __vite__cjsImport9_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport9_react_jsxDevRuntime["Fragment"];import __vite__cjsImport0_react from "/node_modules/.vite/deps/react.js?v=154e64c5";
import api from "/src/utils/api.js";
import ClassBroadsheet from "/src/components/ClassBroadsheet.jsx?t=1788183845351";
import Toast from "/src/components/Toast.jsx";
import StudentRegistrationForm from "/src/components/StudentRegistrationForm.jsx";
import { ArrowLeft, Edit3, CheckSquare, BarChart2, FileSpreadsheet, FileText, Save, Search, Users, Award, CheckCircle, XCircle, Plus, Lock, Printer, BookOpen, Clock, UploadCloud, CheckCircle2, Hourglass, Eye } from "/node_modules/.vite/deps/lucide-react.js?v=154e64c5";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "/node_modules/.vite/deps/recharts.js?v=154e64c5";
import __vite__cjsImport7_html2pdf_js from "/node_modules/.vite/deps/html2pdf__js.js?v=154e64c5";
import { Download } from "/node_modules/.vite/deps/lucide-react.js?v=154e64c5";
var _jsxFileName = "C:/Users/N Concept World/Desktop/Nicholas'_Projects/Jere Model Academy/frontend/src/pages/TeacherDashboard.jsx";
import __vite__cjsImport9_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=154e64c5";
var _s = $RefreshSig$();
export default function TeacherDashboard({ user, settings, activeTab, subTab }) {
	_s();
	const [activeSubTab, setActiveSubTab] = useState("overview");
	const attendanceReportRef = React.useRef(null);
	const schemeReportRef = React.useRef(null);
	const handleDownloadAttendancePDF = () => {
		const element = attendanceReportRef.current;
		if (!element) return;
		const opt = {
			margin: .3,
			filename: `Attendance_Report.pdf`,
			image: {
				type: "jpeg",
				quality: .98
			},
			html2canvas: { scale: 2 },
			jsPDF: {
				unit: "in",
				format: "a4",
				orientation: "portrait"
			}
		};
		html2pdf().set(opt).from(element).save();
	};
	const handleDownloadSchemePDF = () => {
		const element = schemeReportRef.current;
		if (!element) return;
		const opt = {
			margin: .3,
			filename: `Scheme_Of_Work.pdf`,
			image: {
				type: "jpeg",
				quality: .98
			},
			html2canvas: { scale: 2 },
			jsPDF: {
				unit: "in",
				format: "a4",
				orientation: "portrait"
			}
		};
		html2pdf().set(opt).from(element).save();
	};
	// Teacher metadata
	const [assignments, setAssignments] = useState({
		subjects: [],
		formClass: null
	});
	const [selectedSubjectId, setSelectedSubjectId] = useState("");
	const [resultProgress, setResultProgress] = useState(null);
	const [showUploadDetails, setShowUploadDetails] = useState(false);
	// Marks Entry States
	const [selectedClassSubject, setSelectedClassSubject] = useState(null);
	const [studentsGrades, setStudentsGrades] = useState([]);
	// Attendance States
	const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
	const [attendanceRoster, setAttendanceRoster] = useState([]);
	const [attendanceReport, setAttendanceReport] = useState([]);
	const [attendanceReportStartDate, setAttendanceReportStartDate] = useState("");
	const [attendanceReportEndDate, setAttendanceReportEndDate] = useState("");
	const [activeAttendanceSubTab, setActiveAttendanceSubTab] = useState("take");
	// Broadsheet States
	const [broadsheetData, setBroadsheetData] = useState(null);
	// Behavioral / Psychomotor States
	const [skillsList, setSkillsList] = useState([]);
	const [behavioralStudents, setBehavioralStudents] = useState({
		rated: [],
		unrated: []
	});
	const [evaluatingStudent, setEvaluatingStudent] = useState(null);
	const [skillRatings, setSkillRatings] = useState({});
	// Search & Filter States
	const [gradesSearch, setGradesSearch] = useState("");
	const [attendanceSearch, setAttendanceSearch] = useState("");
	const [behavioralSearch, setBehavioralSearch] = useState("");
	const [studentSearch, setStudentSearch] = useState("");
	// My Students States
	const [formClassStudents, setFormClassStudents] = useState([]);
	const [studentsLoading, setStudentsLoading] = useState(false);
	const [showStudentModal, setShowStudentModal] = useState(false);
	const [viewingStudent, setViewingStudent] = useState(null);
	const [studentForm, setStudentForm] = useState({
		surname: "",
		first_name: "",
		other_names: "",
		full_name: "",
		class_id: "",
		date_of_birth: "",
		sex: "Male",
		religion: "Islam",
		address_residence: "",
		last_school_attended: "",
		passport_photo: ""
	});
	// Status banners
	const [notify, setNotify] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	useEffect(() => {
		loadTeacherInfo();
		loadResultProgress();
	}, []);
	useEffect(() => {
		if (activeTab && activeTab !== "dashboard") {
			setActiveSubTab(activeTab);
			if (activeTab === "attendance" && assignments.formClass) {
				fetchAttendance(assignments.formClass.id, attendanceDate);
			}
			if (activeTab === "broadsheet" && assignments.formClass) {
				fetchBroadsheet(assignments.formClass.id);
			}
			if (activeTab === "behavioral" && assignments.formClass) {
				loadBehavioralRoster();
			}
			if (activeTab === "schemes" && assignments.subjects.length > 0 && teacherSchemeAssignIdx === "") {
				setTeacherSchemeAssignIdx(0);
			}
			if (activeTab === "students" && assignments.formClass) {
				loadFormClassStudents(assignments.formClass.id);
			}
		} else if (activeTab === "dashboard") {
			setActiveSubTab("overview");
		}
		if (subTab && activeTab === "attendance") {
			setActiveAttendanceSubTab(subTab);
		}
	}, [
		activeTab,
		subTab,
		assignments.formClass,
		assignments.subjects
	]);
	useEffect(() => {
		if (activeSubTab === "attendance" && activeAttendanceSubTab === "report" && assignments.formClass) {
			fetchAttendanceReport();
		}
	}, [
		activeSubTab,
		activeAttendanceSubTab,
		attendanceReportStartDate,
		attendanceReportEndDate,
		assignments.formClass
	]);
	const loadResultProgress = async () => {
		try {
			const data = await api.getTeacherResultProgress();
			setResultProgress(data);
		} catch (err) {
			console.error("Failed to load result progress:", err);
		}
	};
	const loadTeacherInfo = async () => {
		try {
			const info = await api.getTeacherAssignments();
			setAssignments(info);
			if (info.formClass) {
				// Automatically fetch broadsheet and attendance for form class initially
				fetchBroadsheet(info.formClass.id);
				fetchAttendance(info.formClass.id, attendanceDate);
			}
		} catch (err) {
			setErrorMsg("Failed to sync teacher assignments: " + err.message);
		}
	};
	// ==========================================
	// MY STUDENTS LOGIC
	// ==========================================
	const loadFormClassStudents = async (classId) => {
		if (!classId) return;
		setStudentsLoading(true);
		try {
			const allStudents = await api.getStudents();
			const classStudents = allStudents.filter((s) => s.class_id === classId);
			setFormClassStudents(classStudents);
		} catch (err) {
			setErrorMsg("Failed to load class students: " + err.message);
		} finally {
			setStudentsLoading(false);
		}
	};
	const handleRegisterStudent = async (e) => {
		e.preventDefault();
		if (!assignments.formClass) return;
		setNotify("");
		setErrorMsg("");
		try {
			const payload = {
				...studentForm,
				class_id: assignments.formClass.id
			};
			const res = await api.registerStudent(payload);
			setNotify(`Student registered! Admission No: ${res.admission_number}`);
			setShowStudentModal(false);
			setStudentForm({
				surname: "",
				first_name: "",
				other_names: "",
				full_name: "",
				class_id: "",
				date_of_birth: "",
				sex: "Male",
				religion: "Islam",
				address_residence: "",
				last_school_attended: "",
				passport_photo: ""
			});
			loadFormClassStudents(assignments.formClass.id);
		} catch (err) {
			setErrorMsg("Failed to register student: " + err.message);
		}
	};
	// ==========================================
	// MARKS ENTRY LOGIC
	// ==========================================
	const handleSelectClassSubjectForGrades = async (assign) => {
		setSelectedClassSubject(assign);
		setNotify("");
		setErrorMsg("");
		try {
			const grades = await api.getGradesForEntry(assign.class_id, assign.subject_id, settings.active_term, settings.active_session);
			setStudentsGrades(grades);
			setActiveSubTab("grades");
		} catch (err) {
			setErrorMsg("Failed to load grade book: " + err.message);
		}
	};
	const handleGradeFieldChange = (studentId, field, value) => {
		if (value !== "") {
			const numVal = parseFloat(value);
			if ([
				"ca1",
				"ca2",
				"ca3",
				"ca4"
			].includes(field) && numVal > 10) {
				setErrorMsg("CA score cannot exceed 10 marks.");
				return;
			}
			if (field === "exam_score" && numVal > 60) {
				setErrorMsg("Exam score cannot exceed 60 marks.");
				return;
			}
		}
		setStudentsGrades((prev) => prev.map((g) => {
			if (g.student_id === studentId) {
				const updated = {
					...g,
					[field]: value
				};
				// Auto-calculate total and grade letter
				const c1 = parseFloat(field === "ca1" ? value : updated.ca1 || 0);
				const c2 = parseFloat(field === "ca2" ? value : updated.ca2 || 0);
				const c3 = parseFloat(field === "ca3" ? value : updated.ca3 || 0);
				const c4 = parseFloat(field === "ca4" ? value : updated.ca4 || 0);
				const exam = parseFloat(field === "exam_score" ? value : updated.exam_score || 0);
				const total = c1 + c2 + c3 + c4 + exam;
				updated.total_score = total;
				// Grade Letter mapping
				if (total >= 75) {
					updated.grade_letter = "A";
					updated.remark = "Excellent";
				} else if (total >= 60) {
					updated.grade_letter = "B";
					updated.remark = "Very Good";
				} else if (total >= 50) {
					updated.grade_letter = "C";
					updated.remark = "Good";
				} else if (total >= 40) {
					updated.grade_letter = "D";
					updated.remark = "Pass";
				} else {
					updated.grade_letter = "F";
					updated.remark = "Fail";
				}
				return updated;
			}
			return g;
		}));
	};
	const handleSaveGrades = async () => {
		if (!selectedClassSubject) return;
		setNotify("");
		setErrorMsg("");
		try {
			await api.saveGrades({
				class_id: selectedClassSubject.class_id,
				subject_id: selectedClassSubject.subject_id,
				term: settings.active_term,
				academic_year: settings.active_session,
				grades: studentsGrades
			});
			setNotify("Grades submitted and saved successfully!");
			// Reload broadsheet to keep synchronized
			if (assignments.formClass) fetchBroadsheet(assignments.formClass.id);
		} catch (err) {
			setErrorMsg(err.message);
		}
	};
	// ==========================================
	// ATTENDANCE LOGIC
	// ==========================================
	const fetchAttendance = async (classId, date) => {
		try {
			const roster = await api.getAttendance(classId, date);
			setAttendanceRoster(roster);
		} catch (err) {
			setErrorMsg("Failed to fetch attendance roster: " + err.message);
		}
	};
	const handleAttendanceChange = (studentId, status) => {
		setAttendanceRoster((prev) => prev.map((r) => r.student_id === studentId ? {
			...r,
			status
		} : r));
	};
	const handleSaveAttendance = async () => {
		if (!assignments.formClass) return;
		setNotify("");
		setErrorMsg("");
		try {
			const records = attendanceRoster.map((r) => ({
				student_id: r.student_id,
				status: r.status || "present"
			}));
			await api.saveAttendance({
				class_id: assignments.formClass.id,
				date: attendanceDate,
				records
			});
			setNotify(`Attendance successfully registered for ${attendanceDate}!`);
		} catch (err) {
			setErrorMsg(err.message);
		}
	};
	const fetchAttendanceReport = async () => {
		if (!assignments.formClass) return;
		try {
			const data = await api.getAttendanceReport(assignments.formClass.id, attendanceReportStartDate, attendanceReportEndDate);
			setAttendanceReport(data);
		} catch (err) {
			setErrorMsg("Failed to fetch attendance report: " + err.message);
		}
	};
	// ==========================================
	// BROADSHEET LOGIC
	// ==========================================
	const fetchBroadsheet = async (classId) => {
		try {
			const sheet = await api.getBroadsheet(classId, settings.active_term, settings.active_session);
			setBroadsheetData(sheet);
		} catch (err) {
			setErrorMsg("Failed to sync broadsheet: " + err.message);
		}
	};
	const loadBehavioralRoster = async () => {
		if (!assignments.formClass) return;
		try {
			// 1. Fetch Skills
			const fetchedSkills = await api.getSkills(assignments.formClass.tier);
			setSkillsList(fetchedSkills);
			// 2. Fetch Rated/Unrated Students
			const data = await api.getSkillsStudents(assignments.formClass.id, settings.active_term, settings.active_session);
			setBehavioralStudents(data);
		} catch (err) {
			setErrorMsg("Failed to load psychomotor data: " + err.message);
		}
	};
	const handleSelectStudentForEval = async (student) => {
		setEvaluatingStudent(student);
		setNotify("");
		setErrorMsg("");
		try {
			const existing = await api.getStudentSkillsEvaluation(student.id, settings.active_term, settings.active_session);
			const ratingsMap = {};
			existing.forEach((r) => {
				ratingsMap[`${r.skill_id}_${r.category}`] = r.rating;
			});
			setSkillRatings(ratingsMap);
		} catch (err) {
			setErrorMsg("Failed to fetch existing ratings: " + err.message);
		}
	};
	const handleSaveSkillEvaluation = async (e) => {
		e.preventDefault();
		if (!evaluatingStudent) return;
		setNotify("");
		setErrorMsg("");
		// Validate all skills have a rating
		for (let skill of skillsList) {
			if (!skillRatings[`${skill.id}_${skill.category}`]) {
				setErrorMsg(`Please select a rating for ${skill.name}`);
				return;
			}
		}
		try {
			const payload = {
				student_id: evaluatingStudent.id,
				term: settings.active_term,
				session: settings.active_session,
				ratings: skillsList.map((skill) => ({
					skill_id: skill.id,
					category: skill.category,
					rating: skillRatings[`${skill.id}_${skill.category}`]
				}))
			};
			await api.saveStudentSkillsEvaluation(payload);
			setNotify("Skills evaluation saved successfully!");
			setEvaluatingStudent(null);
			loadBehavioralRoster();
		} catch (err) {
			setErrorMsg(err.message);
		}
	};
	// ==========================================
	// TEACHER SCHEME OF WORK LOGIC
	// ==========================================
	const [teacherSchemeAssignIdx, setTeacherSchemeAssignIdx] = useState("");
	const [teacherSchemeTerm, setTeacherSchemeTerm] = useState("3rd Term");
	const [teacherSchemeWeeks, setTeacherSchemeWeeks] = useState(Array.from({ length: 12 }, (_, i) => ({
		week: i + 1,
		topic: "",
		objectives: "",
		id: null
	})));
	const loadTeacherSchemes = async () => {
		if (teacherSchemeAssignIdx === "") return;
		const assign = assignments.subjects[teacherSchemeAssignIdx];
		if (!assign) return;
		try {
			const data = await api.getSchemes({
				class_id: assign.class_id,
				subject_id: assign.subject_id,
				term: teacherSchemeTerm
			});
			const newWeeks = Array.from({ length: 12 }, (_, i) => {
				const wkNum = i + 1;
				const entry = data.find((item) => item.week === wkNum);
				return {
					week: wkNum,
					topic: entry ? entry.topic : "",
					objectives: entry ? entry.objectives || "" : "",
					id: entry ? entry.id : null
				};
			});
			setTeacherSchemeWeeks(newWeeks);
		} catch (err) {
			setErrorMsg("Failed to load schemes of work: " + err.message);
		}
	};
	const handleTeacherSchemeFieldChange = (weekNum, field, value) => {
		setTeacherSchemeWeeks((prev) => prev.map((w) => {
			if (w.week === weekNum) {
				return {
					...w,
					[field]: value
				};
			}
			return w;
		}));
	};
	const handleSaveTeacherSchemeWeek = async (weekObj) => {
		setNotify("");
		setErrorMsg("");
		if (teacherSchemeAssignIdx === "") return;
		const assign = assignments.subjects[teacherSchemeAssignIdx];
		if (!assign) return;
		if (!weekObj.topic) {
			setErrorMsg(`Topic for Week ${weekObj.week} is required to save.`);
			return;
		}
		try {
			await api.saveScheme({
				class_id: assign.class_id,
				subject_id: assign.subject_id,
				term: teacherSchemeTerm,
				week: weekObj.week,
				topic: weekObj.topic,
				objectives: weekObj.objectives
			});
			setNotify(`Successfully saved Week ${weekObj.week} Scheme of Work!`);
			loadTeacherSchemes();
		} catch (err) {
			setErrorMsg(`Failed to save Week ${weekObj.week}: ` + err.message);
		}
	};
	const handleDeleteTeacherSchemeWeek = async (weekObj) => {
		if (!weekObj.id) {
			handleTeacherSchemeFieldChange(weekObj.week, "topic", "");
			handleTeacherSchemeFieldChange(weekObj.week, "objectives", "");
			return;
		}
		setNotify("");
		setErrorMsg("");
		try {
			await api.deleteScheme(weekObj.id);
			setNotify(`Successfully deleted Week ${weekObj.week} entry.`);
			loadTeacherSchemes();
		} catch (err) {
			setErrorMsg(`Failed to delete Week ${weekObj.week}: ` + err.message);
		}
	};
	useEffect(() => {
		if (activeSubTab === "schemes" && teacherSchemeAssignIdx !== "") {
			loadTeacherSchemes();
		}
	}, [
		activeSubTab,
		teacherSchemeAssignIdx,
		teacherSchemeTerm
	]);
	return /* @__PURE__ */ _jsxDEV("div", {
		style: {
			display: "grid",
			gridTemplateColumns: "1fr",
			gap: "24px"
		},
		children: [
			/* @__PURE__ */ _jsxDEV(Toast, {
				message: notify,
				type: "success",
				onClose: () => setNotify(""),
				duration: 4e3
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 482,
				columnNumber: 7
			}, this),
			/* @__PURE__ */ _jsxDEV(Toast, {
				message: errorMsg,
				type: "error",
				onClose: () => setErrorMsg(""),
				duration: 5e3
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 483,
				columnNumber: 7
			}, this),
			activeSubTab === "overview" && /* @__PURE__ */ _jsxDEV("div", {
				style: {
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "24px"
				},
				children: [
					/* @__PURE__ */ _jsxDEV("div", {
						className: "glass-panel",
						style: {
							gridColumn: "1 / -1",
							padding: "28px",
							backgroundColor: "var(--bg-surface)",
							display: "flex",
							flexDirection: "column",
							gap: "24px"
						},
						children: [
							/* @__PURE__ */ _jsxDEV("div", {
								style: {
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									flexWrap: "wrap",
									gap: "12px"
								},
								children: [/* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
									style: {
										margin: 0,
										display: "flex",
										alignItems: "center",
										gap: "10px",
										fontSize: "1.4rem"
									},
									children: [/* @__PURE__ */ _jsxDEV(BarChart2, {
										size: 24,
										style: { color: "var(--primary)" }
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 499,
										columnNumber: 19
									}, this), " Result Upload Progress"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 498,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("p", {
									style: {
										color: "var(--text-secondary)",
										fontSize: "0.9rem",
										margin: "6px 0 0 0"
									},
									children: ["Marks submission overview for ", /* @__PURE__ */ _jsxDEV("strong", { children: [
										resultProgress?.term || "Current Term",
										" (",
										resultProgress?.academic_year || "Session",
										")"
									] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 502,
										columnNumber: 49
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 501,
									columnNumber: 17
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 497,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									className: "btn btn-outline",
									onClick: () => setShowUploadDetails(!showUploadDetails),
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: showUploadDetails ? "Collapse Details" : "View Details"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 505,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 496,
								columnNumber: 13
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "minmax(200px, 1fr) 2fr",
									gap: "30px",
									alignItems: "center"
								},
								children: [/* @__PURE__ */ _jsxDEV("div", {
									style: {
										height: "220px",
										position: "relative"
									},
									children: [/* @__PURE__ */ _jsxDEV(ResponsiveContainer, {
										width: "100%",
										height: "100%",
										children: /* @__PURE__ */ _jsxDEV(PieChart, { children: [/* @__PURE__ */ _jsxDEV(Pie, {
											data: [
												{
													name: "Completed",
													value: resultProgress?.summary?.completed || 0,
													color: "#10b981"
												},
												{
													name: "In Progress",
													value: resultProgress?.summary?.in_progress || 0,
													color: "#f59e0b"
												},
												{
													name: "Pending",
													value: resultProgress?.summary?.pending || 0,
													color: "#ef4444"
												}
											].filter((d) => d.value > 0),
											cx: "50%",
											cy: "50%",
											innerRadius: 65,
											outerRadius: 90,
											paddingAngle: 5,
											dataKey: "value",
											stroke: "none",
											children: [
												{
													name: "Completed",
													value: resultProgress?.summary?.completed || 0,
													color: "#10b981"
												},
												{
													name: "In Progress",
													value: resultProgress?.summary?.in_progress || 0,
													color: "#f59e0b"
												},
												{
													name: "Pending",
													value: resultProgress?.summary?.pending || 0,
													color: "#ef4444"
												}
											].filter((d) => d.value > 0).map((entry, index) => /* @__PURE__ */ _jsxDEV(Cell, { fill: entry.color }, `cell-${index}`, false, {
												fileName: _jsxFileName,
												lineNumber: 538,
												columnNumber: 25
											}, this))
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 519,
											columnNumber: 21
										}, this), /* @__PURE__ */ _jsxDEV(Tooltip, {
											contentStyle: {
												borderRadius: "8px",
												border: "none",
												boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
											},
											itemStyle: { fontWeight: "bold" }
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 541,
											columnNumber: 21
										}, this)] }, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 518,
											columnNumber: 19
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 517,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										style: {
											position: "absolute",
											top: "50%",
											left: "50%",
											transform: "translate(-50%, -50%)",
											textAlign: "center",
											pointerEvents: "none"
										},
										children: [/* @__PURE__ */ _jsxDEV("div", {
											style: {
												fontSize: "2rem",
												fontWeight: "800",
												color: resultProgress?.summary?.percentage === 100 ? "#10b981" : "var(--text-primary)",
												lineHeight: "1"
											},
											children: [resultProgress?.summary?.percentage || 0, "%"]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 552,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("div", {
											style: {
												fontSize: "0.75rem",
												color: "var(--text-muted)",
												fontWeight: "600",
												textTransform: "uppercase",
												marginTop: "4px"
											},
											children: "Done"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 555,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 548,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 516,
									columnNumber: 15
								}, this), /* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "repeat(2, 1fr)",
										gap: "16px"
									},
									children: [
										/* @__PURE__ */ _jsxDEV("div", {
											style: {
												padding: "16px",
												borderRadius: "12px",
												backgroundColor: "rgba(59, 130, 246, 0.05)",
												border: "1px solid rgba(59, 130, 246, 0.15)",
												display: "flex",
												flexDirection: "column",
												gap: "8px",
												transition: "transform 0.2s",
												cursor: "default"
											},
											onMouseEnter: (e) => e.currentTarget.style.transform = "translateY(-2px)",
											onMouseLeave: (e) => e.currentTarget.style.transform = "none",
											children: [/* @__PURE__ */ _jsxDEV("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													color: "#3b82f6",
													fontSize: "0.85rem",
													fontWeight: "600"
												},
												children: [/* @__PURE__ */ _jsxDEV(BookOpen, { size: 16 }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 562,
													columnNumber: 144
												}, this), " Total Subjects"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 562,
												columnNumber: 19
											}, this), /* @__PURE__ */ _jsxDEV("div", {
												style: {
													fontSize: "1.8rem",
													fontWeight: "800",
													color: "#1e40af"
												},
												children: resultProgress?.summary?.total || 0
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 563,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 561,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ _jsxDEV("div", {
											style: {
												padding: "16px",
												borderRadius: "12px",
												backgroundColor: "rgba(16, 185, 129, 0.05)",
												border: "1px solid rgba(16, 185, 129, 0.15)",
												display: "flex",
												flexDirection: "column",
												gap: "8px",
												transition: "transform 0.2s",
												cursor: "default"
											},
											onMouseEnter: (e) => e.currentTarget.style.transform = "translateY(-2px)",
											onMouseLeave: (e) => e.currentTarget.style.transform = "none",
											children: [/* @__PURE__ */ _jsxDEV("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													color: "#10b981",
													fontSize: "0.85rem",
													fontWeight: "600"
												},
												children: [/* @__PURE__ */ _jsxDEV(CheckCircle2, { size: 16 }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 566,
													columnNumber: 144
												}, this), " Fully Uploaded"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 566,
												columnNumber: 19
											}, this), /* @__PURE__ */ _jsxDEV("div", {
												style: {
													fontSize: "1.8rem",
													fontWeight: "800",
													color: "#065f46"
												},
												children: resultProgress?.summary?.completed || 0
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 567,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 565,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ _jsxDEV("div", {
											style: {
												padding: "16px",
												borderRadius: "12px",
												backgroundColor: "rgba(245, 158, 11, 0.05)",
												border: "1px solid rgba(245, 158, 11, 0.15)",
												display: "flex",
												flexDirection: "column",
												gap: "8px",
												transition: "transform 0.2s",
												cursor: "default"
											},
											onMouseEnter: (e) => e.currentTarget.style.transform = "translateY(-2px)",
											onMouseLeave: (e) => e.currentTarget.style.transform = "none",
											children: [/* @__PURE__ */ _jsxDEV("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													color: "#f59e0b",
													fontSize: "0.85rem",
													fontWeight: "600"
												},
												children: [/* @__PURE__ */ _jsxDEV(Hourglass, { size: 16 }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 570,
													columnNumber: 144
												}, this), " In Progress"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 570,
												columnNumber: 19
											}, this), /* @__PURE__ */ _jsxDEV("div", {
												style: {
													fontSize: "1.8rem",
													fontWeight: "800",
													color: "#92400e"
												},
												children: resultProgress?.summary?.in_progress || 0
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 571,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 569,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ _jsxDEV("div", {
											style: {
												padding: "16px",
												borderRadius: "12px",
												backgroundColor: "rgba(239, 68, 68, 0.05)",
												border: "1px solid rgba(239, 68, 68, 0.15)",
												display: "flex",
												flexDirection: "column",
												gap: "8px",
												transition: "transform 0.2s",
												cursor: "default"
											},
											onMouseEnter: (e) => e.currentTarget.style.transform = "translateY(-2px)",
											onMouseLeave: (e) => e.currentTarget.style.transform = "none",
											children: [/* @__PURE__ */ _jsxDEV("div", {
												style: {
													display: "flex",
													alignItems: "center",
													gap: "6px",
													color: "#ef4444",
													fontSize: "0.85rem",
													fontWeight: "600"
												},
												children: [/* @__PURE__ */ _jsxDEV(Clock, { size: 16 }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 574,
													columnNumber: 144
												}, this), " Pending Uploads"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 574,
												columnNumber: 19
											}, this), /* @__PURE__ */ _jsxDEV("div", {
												style: {
													fontSize: "1.8rem",
													fontWeight: "800",
													color: "#991b1b"
												},
												children: resultProgress?.summary?.pending || 0
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 575,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 573,
											columnNumber: 17
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 560,
									columnNumber: 15
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 514,
								columnNumber: 13
							}, this),
							showUploadDetails && resultProgress?.details && resultProgress.details.length > 0 && /* @__PURE__ */ _jsxDEV("div", {
								style: {
									overflowX: "auto",
									marginTop: "10px",
									borderRadius: "10px",
									border: "1px solid var(--border-color)"
								},
								children: /* @__PURE__ */ _jsxDEV("table", {
									className: "school-table",
									style: {
										width: "100%",
										fontSize: "0.9rem",
										margin: 0
									},
									children: [/* @__PURE__ */ _jsxDEV("thead", {
										style: { backgroundColor: "#f8fafc" },
										children: /* @__PURE__ */ _jsxDEV("tr", { children: [
											/* @__PURE__ */ _jsxDEV("th", {
												style: { padding: "14px" },
												children: "Class Arm"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 586,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ _jsxDEV("th", {
												style: { padding: "14px" },
												children: "Subject"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 587,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ _jsxDEV("th", {
												style: { padding: "14px" },
												children: "Progress"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 588,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ _jsxDEV("th", {
												style: { padding: "14px" },
												children: "Status"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 589,
												columnNumber: 23
											}, this),
											/* @__PURE__ */ _jsxDEV("th", {
												style: { padding: "14px" },
												children: "Action"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 590,
												columnNumber: 23
											}, this)
										] }, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 585,
											columnNumber: 21
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 584,
										columnNumber: 19
									}, this), /* @__PURE__ */ _jsxDEV("tbody", { children: resultProgress.details.map((item, idx) => /* @__PURE__ */ _jsxDEV("tr", {
										style: {
											transition: "background-color 0.2s",
											borderBottom: "1px solid var(--border-color)"
										},
										onMouseEnter: (e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.01)",
										onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "transparent",
										children: [
											/* @__PURE__ */ _jsxDEV("td", {
												style: { padding: "14px" },
												children: /* @__PURE__ */ _jsxDEV("strong", { children: item.class_name }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 596,
													columnNumber: 57
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 596,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ _jsxDEV("td", {
												style: { padding: "14px" },
												children: item.subject_name
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 597,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ _jsxDEV("td", {
												style: {
													padding: "14px",
													width: "220px"
												},
												children: /* @__PURE__ */ _jsxDEV("div", {
													style: {
														display: "flex",
														alignItems: "center",
														gap: "10px"
													},
													children: [/* @__PURE__ */ _jsxDEV("div", {
														style: {
															flex: 1,
															height: "8px",
															backgroundColor: "var(--bg-secondary)",
															borderRadius: "4px",
															overflow: "hidden"
														},
														children: /* @__PURE__ */ _jsxDEV("div", { style: {
															width: `${item.percentage}%`,
															height: "100%",
															backgroundColor: item.status === "Completed" ? "#10b981" : item.status === "In Progress" ? "#f59e0b" : "#ef4444"
														} }, void 0, false, {
															fileName: _jsxFileName,
															lineNumber: 601,
															columnNumber: 31
														}, this)
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 600,
														columnNumber: 29
													}, this), /* @__PURE__ */ _jsxDEV("span", {
														style: {
															fontSize: "0.8rem",
															fontWeight: "700",
															minWidth: "40px",
															color: "var(--text-secondary)"
														},
														children: [
															item.uploaded_count,
															"/",
															item.total_students
														]
													}, void 0, true, {
														fileName: _jsxFileName,
														lineNumber: 607,
														columnNumber: 29
													}, this)]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 599,
													columnNumber: 27
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 598,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ _jsxDEV("td", {
												style: { padding: "14px" },
												children: /* @__PURE__ */ _jsxDEV("div", {
													style: {
														display: "inline-flex",
														alignItems: "center",
														gap: "6px",
														padding: "6px 12px",
														borderRadius: "20px",
														fontSize: "0.8rem",
														fontWeight: "600",
														backgroundColor: item.status === "Completed" ? "rgba(16, 185, 129, 0.1)" : item.status === "In Progress" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
														color: item.status === "Completed" ? "#10b981" : item.status === "In Progress" ? "#d97706" : "#ef4444"
													},
													children: [item.status === "Completed" ? /* @__PURE__ */ _jsxDEV(CheckCircle2, { size: 14 }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 618,
														columnNumber: 60
													}, this) : item.status === "In Progress" ? /* @__PURE__ */ _jsxDEV(Hourglass, { size: 14 }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 618,
														columnNumber: 121
													}, this) : /* @__PURE__ */ _jsxDEV(Clock, { size: 14 }, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 618,
														columnNumber: 147
													}, this), item.status]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 613,
													columnNumber: 27
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 612,
												columnNumber: 25
											}, this),
											/* @__PURE__ */ _jsxDEV("td", {
												style: { padding: "14px" },
												children: /* @__PURE__ */ _jsxDEV("button", {
													className: "btn btn-secondary",
													style: {
														fontSize: "0.8rem",
														padding: "6px 14px",
														borderRadius: "6px",
														display: "flex",
														alignItems: "center",
														gap: "6px",
														border: "1px solid var(--border-color)",
														backgroundColor: "#fff"
													},
													onClick: () => handleSelectClassSubjectForGrades({
														class_id: item.class_id,
														class_name: item.class_name,
														subject_id: item.subject_id,
														subject_name: item.subject_name
													}),
													children: [/* @__PURE__ */ _jsxDEV(UploadCloud, {
														size: 14,
														style: { color: "var(--primary)" }
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 628,
														columnNumber: 29
													}, this), item.status === "Completed" ? "View/Edit" : "Upload Marks"]
												}, void 0, true, {
													fileName: _jsxFileName,
													lineNumber: 623,
													columnNumber: 27
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 622,
												columnNumber: 25
											}, this)
										]
									}, idx, true, {
										fileName: _jsxFileName,
										lineNumber: 595,
										columnNumber: 23
									}, this)) }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 593,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 583,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 582,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 495,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "glass-panel",
						style: {
							padding: "28px",
							backgroundColor: "var(--bg-surface)",
							display: "flex",
							flexDirection: "column",
							gap: "16px"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								fontSize: "1.25rem",
								color: "var(--text-primary)"
							},
							children: "My Assigned Subjects"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 643,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "var(--text-secondary)",
								fontSize: "0.9rem",
								margin: "4px 0 0 0"
							},
							children: "Select a subject stream below to open the grading spreadsheet."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 644,
							columnNumber: 15
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 642,
							columnNumber: 13
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							style: {
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
								gap: "16px"
							},
							children: assignments.subjects.length === 0 ? /* @__PURE__ */ _jsxDEV("div", {
								style: {
									padding: "20px",
									textAlign: "center",
									backgroundColor: "var(--bg-secondary)",
									borderRadius: "12px",
									color: "var(--text-muted)"
								},
								children: "You are not currently assigned to teach any subjects."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 651,
								columnNumber: 17
							}, this) : assignments.subjects.map((assign, idx) => /* @__PURE__ */ _jsxDEV("button", {
								className: "btn",
								style: {
									display: "flex",
									flexDirection: "column",
									gap: "12px",
									padding: "20px",
									textAlign: "left",
									backgroundColor: "#f8fafc",
									color: "var(--text-primary)",
									border: "1px solid var(--border-color)",
									borderRadius: "12px",
									cursor: "pointer",
									transition: "all 0.2s",
									boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
								},
								onMouseEnter: (e) => {
									e.currentTarget.style.transform = "translateY(-3px)";
									e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.05)";
									e.currentTarget.style.borderColor = "var(--primary)";
								},
								onMouseLeave: (e) => {
									e.currentTarget.style.transform = "none";
									e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
									e.currentTarget.style.borderColor = "var(--border-color)";
								},
								onClick: () => handleSelectClassSubjectForGrades(assign),
								children: [/* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("div", {
									style: {
										fontWeight: "700",
										fontSize: "1.05rem",
										color: "var(--primary)"
									},
									children: assign.class_name
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 669,
									columnNumber: 23
								}, this), /* @__PURE__ */ _jsxDEV("div", {
									style: {
										fontSize: "0.85rem",
										color: "var(--text-secondary)",
										marginTop: "2px"
									},
									children: assign.subject_name
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 670,
									columnNumber: 23
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 668,
									columnNumber: 21
								}, this), /* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px",
										fontSize: "0.8rem",
										fontWeight: "600",
										color: "var(--primary)",
										marginTop: "auto"
									},
									children: [/* @__PURE__ */ _jsxDEV(Edit3, { size: 14 }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 673,
										columnNumber: 23
									}, this), " Enter Marks"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 672,
									columnNumber: 21
								}, this)]
							}, idx, true, {
								fileName: _jsxFileName,
								lineNumber: 656,
								columnNumber: 19
							}, this))
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 649,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 641,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "glass-panel",
						style: {
							padding: "28px",
							backgroundColor: "var(--bg-surface)",
							display: "flex",
							flexDirection: "column",
							gap: "16px"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", { children: /* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								fontSize: "1.25rem",
								color: "var(--text-primary)"
							},
							children: "Form Master Status"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 683,
							columnNumber: 15
						}, this) }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 682,
							columnNumber: 13
						}, this), assignments.formClass ? /* @__PURE__ */ _jsxDEV("div", {
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "20px"
							},
							children: [
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										backgroundColor: "rgba(59, 130, 246, 0.05)",
										color: "var(--primary)",
										padding: "20px",
										borderRadius: "12px",
										border: "1px solid rgba(59, 130, 246, 0.15)",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between"
									},
									children: [/* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("div", {
										style: {
											fontSize: "0.8rem",
											fontWeight: "600",
											textTransform: "uppercase",
											letterSpacing: "0.05em"
										},
										children: "Form Master of"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 692,
										columnNumber: 21
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										style: {
											fontSize: "1.4rem",
											fontWeight: "800",
											marginTop: "4px"
										},
										children: assignments.formClass.name
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 693,
										columnNumber: 21
									}, this)] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 691,
										columnNumber: 19
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										style: {
											width: "48px",
											height: "48px",
											borderRadius: "50%",
											backgroundColor: "rgba(59, 130, 246, 0.15)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center"
										},
										children: /* @__PURE__ */ _jsxDEV(Users, {
											size: 24,
											style: { color: "var(--primary)" }
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 696,
											columnNumber: 21
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 695,
										columnNumber: 19
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 687,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ _jsxDEV("p", {
									style: {
										color: "var(--text-secondary)",
										fontSize: "0.9rem",
										margin: 0,
										lineHeight: "1.5"
									},
									children: "As Form Master, you have access to daily attendance checklists and the complete class broadsheet for academic reviews."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 699,
									columnNumber: 17
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "flex",
										flexWrap: "wrap",
										gap: "12px"
									},
									children: [
										/* @__PURE__ */ _jsxDEV("button", {
											className: "btn btn-primary",
											style: {
												padding: "10px 20px",
												display: "flex",
												alignItems: "center",
												gap: "8px"
											},
											onClick: () => {
												setActiveSubTab("attendance");
												fetchAttendance(assignments.formClass.id, attendanceDate);
											},
											children: [/* @__PURE__ */ _jsxDEV(CheckSquare, { size: 16 }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 704,
												columnNumber: 21
											}, this), " Mark Attendance"]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 703,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ _jsxDEV("button", {
											className: "btn btn-secondary",
											style: {
												padding: "10px 20px",
												display: "flex",
												alignItems: "center",
												gap: "8px",
												backgroundColor: "#fff",
												border: "1px solid var(--border-color)"
											},
											onClick: () => {
												setActiveSubTab("broadsheet");
												fetchBroadsheet(assignments.formClass.id);
											},
											children: [/* @__PURE__ */ _jsxDEV(FileSpreadsheet, { size: 16 }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 707,
												columnNumber: 21
											}, this), " View Class Results"]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 706,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ _jsxDEV("button", {
											className: "btn btn-secondary",
											style: {
												padding: "10px 20px",
												display: "flex",
												alignItems: "center",
												gap: "8px",
												backgroundColor: "#fff",
												border: "1px solid var(--border-color)"
											},
											onClick: () => {
												setActiveSubTab("behavioral");
												loadBehavioralRoster();
											},
											children: [/* @__PURE__ */ _jsxDEV(Award, { size: 16 }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 710,
												columnNumber: 21
											}, this), " Evaluate Psychomotor"]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 709,
											columnNumber: 19
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 702,
									columnNumber: 17
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 686,
							columnNumber: 15
						}, this) : /* @__PURE__ */ _jsxDEV("div", {
							style: {
								padding: "20px",
								textAlign: "center",
								backgroundColor: "var(--bg-secondary)",
								borderRadius: "12px",
								color: "var(--text-muted)"
							},
							children: "You are not currently assigned as a Class Teacher for any class."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 715,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 681,
						columnNumber: 11
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 491,
				columnNumber: 9
			}, this),
			activeSubTab === "grades" && !selectedClassSubject && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					backgroundColor: "var(--bg-surface)",
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "15px",
						background: "linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)",
						padding: "24px",
						color: "white",
						boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
					},
					children: [/* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "15px"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "48px",
								height: "48px",
								borderRadius: "50%",
								backgroundColor: "rgba(255,255,255,0.15)",
								backdropFilter: "blur(10px)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "2px solid rgba(255,255,255,0.4)"
							},
							children: /* @__PURE__ */ _jsxDEV(Edit3, {
								size: 24,
								color: "white"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 733,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 732,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								fontSize: "1.25rem",
								fontWeight: "700"
							},
							children: "Enter Marks"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 736,
							columnNumber: 17
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "rgba(255,255,255,0.85)",
								fontSize: "0.85rem",
								margin: "4px 0 0 0"
							},
							children: "Select a subject below to open the grading spreadsheet."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 737,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 735,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 731,
						columnNumber: 13
					}, this), /* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							backgroundColor: "rgba(255,255,255,0.15)",
							borderRadius: "20px",
							padding: "8px 16px",
							fontSize: "0.82rem",
							fontWeight: "600"
						},
						children: [
							/* @__PURE__ */ _jsxDEV(FileText, { size: 14 }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 741,
								columnNumber: 15
							}, this),
							" ",
							assignments.subjects.length,
							" subject",
							assignments.subjects.length !== 1 ? "s" : "",
							" assigned"
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 740,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 730,
					columnNumber: 11
				}, this), /* @__PURE__ */ _jsxDEV("div", {
					style: { padding: "24px" },
					children: /* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
							gap: "16px"
						},
						children: assignments.subjects.length === 0 ? /* @__PURE__ */ _jsxDEV("div", {
							style: {
								gridColumn: "1/-1",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								padding: "40px",
								gap: "12px",
								textAlign: "center"
							},
							children: [/* @__PURE__ */ _jsxDEV(FileText, {
								size: 40,
								style: { opacity: .3 }
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 748,
								columnNumber: 19
							}, this), /* @__PURE__ */ _jsxDEV("p", {
								style: {
									color: "var(--text-muted)",
									margin: 0
								},
								children: "You are not currently assigned to teach any subjects."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 749,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 747,
							columnNumber: 17
						}, this) : assignments.subjects.map((assign, idx) => /* @__PURE__ */ _jsxDEV("button", {
							className: "btn",
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "10px",
								padding: "20px",
								textAlign: "left",
								backgroundColor: "rgba(217,119,6,0.05)",
								color: "var(--text-primary)",
								border: "1.5px solid rgba(217,119,6,0.2)",
								borderRadius: "12px",
								cursor: "pointer",
								transition: "all 0.2s"
							},
							onMouseEnter: (e) => {
								e.currentTarget.style.backgroundColor = "rgba(217,119,6,0.12)";
								e.currentTarget.style.transform = "translateY(-2px)";
								e.currentTarget.style.boxShadow = "0 4px 12px rgba(217,119,6,0.15)";
							},
							onMouseLeave: (e) => {
								e.currentTarget.style.backgroundColor = "rgba(217,119,6,0.05)";
								e.currentTarget.style.transform = "none";
								e.currentTarget.style.boxShadow = "none";
							},
							onClick: () => handleSelectClassSubjectForGrades(assign),
							children: [/* @__PURE__ */ _jsxDEV("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "10px"
								},
								children: [/* @__PURE__ */ _jsxDEV("div", {
									style: {
										width: "36px",
										height: "36px",
										borderRadius: "8px",
										backgroundColor: "rgba(217,119,6,0.15)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										flexShrink: 0
									},
									children: /* @__PURE__ */ _jsxDEV(BookOpen, {
										size: 18,
										style: { color: "#d97706" }
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 763,
										columnNumber: 25
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 762,
									columnNumber: 23
								}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("div", {
									style: {
										fontWeight: "700",
										fontSize: "0.95rem"
									},
									children: assign.subject_name
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 766,
									columnNumber: 25
								}, this), /* @__PURE__ */ _jsxDEV("div", {
									style: {
										fontSize: "0.78rem",
										color: "var(--text-secondary)"
									},
									children: assign.class_name
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 767,
									columnNumber: 25
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 765,
									columnNumber: 23
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 761,
								columnNumber: 21
							}, this), /* @__PURE__ */ _jsxDEV("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "6px",
									fontSize: "0.82rem",
									fontWeight: "600",
									color: "#d97706"
								},
								children: [/* @__PURE__ */ _jsxDEV(Edit3, { size: 13 }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 771,
									columnNumber: 23
								}, this), " Enter Marks â??"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 770,
								columnNumber: 21
							}, this)]
						}, idx, true, {
							fileName: _jsxFileName,
							lineNumber: 753,
							columnNumber: 19
						}, this))
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 745,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 744,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 728,
				columnNumber: 9
			}, this),
			activeSubTab === "grades" && selectedClassSubject && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					backgroundColor: "var(--bg-surface)",
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "15px",
						background: "linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)",
						padding: "24px",
						color: "white",
						boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
					},
					children: [/* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "15px"
						},
						children: [
							/* @__PURE__ */ _jsxDEV("button", {
								className: "btn no-print",
								onClick: () => {
									setSelectedClassSubject(null);
									setActiveSubTab("overview");
								},
								style: {
									width: "40px",
									height: "40px",
									borderRadius: "50%",
									backgroundColor: "rgba(255,255,255,0.15)",
									border: "1.5px solid rgba(255,255,255,0.4)",
									color: "white",
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
									fontSize: "1.1rem",
									transition: "all 0.2s"
								},
								title: "Back to overview",
								children: "â?"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 786,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								style: {
									width: "48px",
									height: "48px",
									borderRadius: "50%",
									backgroundColor: "rgba(255,255,255,0.15)",
									backdropFilter: "blur(10px)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									border: "2px solid rgba(255,255,255,0.4)"
								},
								children: /* @__PURE__ */ _jsxDEV(Edit3, {
									size: 24,
									color: "white"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 793,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 792,
								columnNumber: 15
							}, this),
							/* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
								style: {
									margin: 0,
									fontSize: "1.25rem",
									fontWeight: "700"
								},
								children: selectedClassSubject.subject_name
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 796,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("p", {
								style: {
									color: "rgba(255,255,255,0.85)",
									fontSize: "0.85rem",
									margin: "4px 0 0 0"
								},
								children: [
									selectedClassSubject.class_name,
									" Â· ",
									settings.active_term,
									" Â· ",
									settings.active_session
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 797,
								columnNumber: 17
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 795,
								columnNumber: 15
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 785,
						columnNumber: 13
					}, this), !settings.result_entry_open ? /* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "6px",
							backgroundColor: "rgba(0,0,0,0.2)",
							borderRadius: "20px",
							padding: "8px 16px",
							fontSize: "0.82rem",
							fontWeight: "700",
							border: "1px dashed rgba(255,255,255,0.3)"
						},
						children: [/* @__PURE__ */ _jsxDEV(Lock, { size: 14 }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 804,
							columnNumber: 17
						}, this), " Locked by Admin"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 803,
						columnNumber: 15
					}, this) : /* @__PURE__ */ _jsxDEV("button", {
						className: "btn no-print",
						onClick: handleSaveGrades,
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							backgroundColor: "rgba(255,255,255,0.2)",
							backdropFilter: "blur(5px)",
							border: "1.5px solid rgba(255,255,255,0.5)",
							color: "white",
							padding: "10px 20px",
							borderRadius: "20px",
							fontWeight: "700",
							cursor: "pointer",
							transition: "all 0.2s"
						},
						onMouseEnter: (e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)",
						onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)",
						children: [/* @__PURE__ */ _jsxDEV(Save, { size: 16 }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 814,
							columnNumber: 17
						}, this), " Save Marks"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 807,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 784,
					columnNumber: 11
				}, this), /* @__PURE__ */ _jsxDEV("div", {
					style: { padding: "24px" },
					children: [/* @__PURE__ */ _jsxDEV("div", {
						style: { marginBottom: "20px" },
						children: /* @__PURE__ */ _jsxDEV("div", {
							style: {
								position: "relative",
								maxWidth: "360px"
							},
							children: [/* @__PURE__ */ _jsxDEV(Search, {
								size: 16,
								style: {
									position: "absolute",
									left: "12px",
									top: "50%",
									transform: "translateY(-50%)",
									color: "var(--text-muted)"
								}
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 823,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("input", {
								type: "text",
								className: "form-control",
								style: { paddingLeft: "36px" },
								placeholder: "Search student by name or admission no...",
								value: gradesSearch,
								onChange: (e) => setGradesSearch(e.target.value)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 824,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 822,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 821,
						columnNumber: 13
					}, this), /* @__PURE__ */ _jsxDEV("div", {
						className: "grade-table-container",
						children: /* @__PURE__ */ _jsxDEV("table", {
							className: "grade-entry-table",
							children: [/* @__PURE__ */ _jsxDEV("thead", { children: /* @__PURE__ */ _jsxDEV("tr", { children: [
								/* @__PURE__ */ _jsxDEV("th", { children: "Student Name" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 839,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ _jsxDEV("th", { children: "Admission No" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 840,
									columnNumber: 21
								}, this),
								(!settings.max_ca_count || settings.max_ca_count >= 1) && /* @__PURE__ */ _jsxDEV("th", {
									style: { width: "90px" },
									children: [settings.ca1_name || "CA 1", " (10)"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 841,
									columnNumber: 80
								}, this),
								(!settings.max_ca_count || settings.max_ca_count >= 2) && /* @__PURE__ */ _jsxDEV("th", {
									style: { width: "90px" },
									children: [settings.ca2_name || "CA 2", " (10)"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 842,
									columnNumber: 80
								}, this),
								(!settings.max_ca_count || settings.max_ca_count >= 3) && /* @__PURE__ */ _jsxDEV("th", {
									style: { width: "90px" },
									children: [settings.ca3_name || "CA 3", " (10)"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 843,
									columnNumber: 80
								}, this),
								(!settings.max_ca_count || settings.max_ca_count >= 4) && /* @__PURE__ */ _jsxDEV("th", {
									style: { width: "90px" },
									children: [settings.ca4_name || "CA 4", " (10)"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 844,
									columnNumber: 80
								}, this),
								/* @__PURE__ */ _jsxDEV("th", {
									style: { width: "110px" },
									children: [settings.exam_name || "Exam", " (60)"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 845,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ _jsxDEV("th", {
									style: {
										width: "90px",
										textAlign: "center"
									},
									children: "Total (100)"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 846,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ _jsxDEV("th", {
									style: {
										width: "90px",
										textAlign: "center"
									},
									children: "Grade"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 847,
									columnNumber: 21
								}, this),
								/* @__PURE__ */ _jsxDEV("th", { children: "Remarks" }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 848,
									columnNumber: 21
								}, this)
							] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 838,
								columnNumber: 19
							}, this) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 837,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("tbody", { children: studentsGrades.length === 0 ? /* @__PURE__ */ _jsxDEV("tr", { children: /* @__PURE__ */ _jsxDEV("td", {
								colSpan: 10,
								style: {
									textAlign: "center",
									color: "var(--text-muted)"
								},
								children: "No students registered in this class."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 854,
								columnNumber: 23
							}, this) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 853,
								columnNumber: 21
							}, this) : studentsGrades.filter((g) => g.full_name.toLowerCase().includes(gradesSearch.toLowerCase()) || g.admission_number.toLowerCase().includes(gradesSearch.toLowerCase())).map((g, idx) => /* @__PURE__ */ _jsxDEV("tr", { children: [
								/* @__PURE__ */ _jsxDEV("td", {
									style: {
										fontWeight: "600",
										color: "var(--text-primary)"
									},
									children: g.full_name
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 862,
									columnNumber: 25
								}, this),
								/* @__PURE__ */ _jsxDEV("td", { children: /* @__PURE__ */ _jsxDEV("code", { children: g.admission_number }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 863,
									columnNumber: 29
								}, this) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 863,
									columnNumber: 25
								}, this),
								(!settings.max_ca_count || settings.max_ca_count >= 1) && /* @__PURE__ */ _jsxDEV("td", { children: /* @__PURE__ */ _jsxDEV("input", {
									type: "number",
									min: "0",
									max: "10",
									className: "grade-input",
									value: g.ca1 ?? 0,
									onChange: (e) => handleGradeFieldChange(g.student_id, "ca1", e.target.value),
									disabled: !settings.result_entry_open
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 866,
									columnNumber: 29
								}, this) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 865,
									columnNumber: 27
								}, this),
								(!settings.max_ca_count || settings.max_ca_count >= 2) && /* @__PURE__ */ _jsxDEV("td", { children: /* @__PURE__ */ _jsxDEV("input", {
									type: "number",
									min: "0",
									max: "10",
									className: "grade-input",
									value: g.ca2 ?? 0,
									onChange: (e) => handleGradeFieldChange(g.student_id, "ca2", e.target.value),
									disabled: !settings.result_entry_open
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 871,
									columnNumber: 29
								}, this) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 870,
									columnNumber: 27
								}, this),
								(!settings.max_ca_count || settings.max_ca_count >= 3) && /* @__PURE__ */ _jsxDEV("td", { children: /* @__PURE__ */ _jsxDEV("input", {
									type: "number",
									min: "0",
									max: "10",
									className: "grade-input",
									value: g.ca3 ?? 0,
									onChange: (e) => handleGradeFieldChange(g.student_id, "ca3", e.target.value),
									disabled: !settings.result_entry_open
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 876,
									columnNumber: 29
								}, this) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 875,
									columnNumber: 27
								}, this),
								(!settings.max_ca_count || settings.max_ca_count >= 4) && /* @__PURE__ */ _jsxDEV("td", { children: /* @__PURE__ */ _jsxDEV("input", {
									type: "number",
									min: "0",
									max: "10",
									className: "grade-input",
									value: g.ca4 ?? 0,
									onChange: (e) => handleGradeFieldChange(g.student_id, "ca4", e.target.value),
									disabled: !settings.result_entry_open
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 881,
									columnNumber: 29
								}, this) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 880,
									columnNumber: 27
								}, this),
								/* @__PURE__ */ _jsxDEV("td", { children: /* @__PURE__ */ _jsxDEV("input", {
									type: "number",
									min: "0",
									max: "60",
									className: "grade-input",
									value: g.exam_score ?? 0,
									onChange: (e) => handleGradeFieldChange(g.student_id, "exam_score", e.target.value),
									disabled: !settings.result_entry_open
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 885,
									columnNumber: 27
								}, this) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 884,
									columnNumber: 25
								}, this),
								/* @__PURE__ */ _jsxDEV("td", {
									style: { textAlign: "center" },
									children: /* @__PURE__ */ _jsxDEV("span", {
										className: "grade-total-col",
										children: g.total_score ?? 0
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 888,
										columnNumber: 27
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 887,
									columnNumber: 25
								}, this),
								/* @__PURE__ */ _jsxDEV("td", {
									style: { textAlign: "center" },
									children: /* @__PURE__ */ _jsxDEV("span", {
										className: `grade-badge ${g.grade_letter === "F" ? "grade-badge-fail" : "grade-badge-pass"}`,
										children: g.grade_letter || "-"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 891,
										columnNumber: 27
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 890,
									columnNumber: 25
								}, this),
								/* @__PURE__ */ _jsxDEV("td", { children: /* @__PURE__ */ _jsxDEV("input", {
									type: "text",
									className: "grade-remark-input",
									value: g.remark || "",
									onChange: (e) => handleGradeFieldChange(g.student_id, "remark", e.target.value),
									disabled: !settings.result_entry_open,
									placeholder: "Auto remark..."
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 894,
									columnNumber: 27
								}, this) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 893,
									columnNumber: 25
								}, this)
							] }, idx, true, {
								fileName: _jsxFileName,
								lineNumber: 861,
								columnNumber: 23
							}, this)) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 851,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 836,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 835,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 819,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 782,
				columnNumber: 9
			}, this),
			activeSubTab === "attendance" && !assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					padding: "28px",
					backgroundColor: "var(--bg-surface)"
				},
				children: /* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "40px",
						gap: "16px",
						textAlign: "center"
					},
					children: [
						/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "64px",
								height: "64px",
								borderRadius: "50%",
								backgroundColor: "rgba(59,130,246,0.1)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							},
							children: /* @__PURE__ */ _jsxDEV(CheckSquare, {
								size: 32,
								style: { color: "var(--primary)" }
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 913,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 912,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								color: "var(--text-primary)"
							},
							children: "Class Attendance"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 915,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "var(--text-muted)",
								maxWidth: "400px",
								margin: 0
							},
							children: "You must be assigned as a Form Master to manage class attendance."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 916,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 911,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 910,
				columnNumber: 9
			}, this),
			activeSubTab === "attendance" && assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					backgroundColor: "var(--bg-surface)",
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "15px",
						background: "linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)",
						padding: "24px",
						color: "white",
						boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
					},
					children: /* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "15px"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "48px",
								height: "48px",
								borderRadius: "50%",
								backgroundColor: "rgba(255,255,255,0.15)",
								backdropFilter: "blur(10px)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "2px solid rgba(255,255,255,0.4)"
							},
							children: /* @__PURE__ */ _jsxDEV(CheckSquare, {
								size: 24,
								color: "white"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 926,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 925,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								fontSize: "1.25rem",
								fontWeight: "700"
							},
							children: ["Class Attendance: ", assignments.formClass.name]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 929,
							columnNumber: 17
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "rgba(255,255,255,0.85)",
								fontSize: "0.85rem",
								margin: "4px 0 0 0"
							},
							children: "Track daily attendance and generate summary reports."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 930,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 928,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 924,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 923,
					columnNumber: 11
				}, this), /* @__PURE__ */ _jsxDEV("div", {
					style: { padding: "24px" },
					children: [/* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							gap: "8px",
							marginBottom: "24px"
						},
						className: "no-print",
						children: [/* @__PURE__ */ _jsxDEV("button", {
							onClick: () => setActiveAttendanceSubTab("take"),
							style: {
								padding: "8px 18px",
								background: activeAttendanceSubTab === "take" ? "var(--primary)" : "transparent",
								border: "1px solid " + (activeAttendanceSubTab === "take" ? "var(--primary)" : "var(--border-color)"),
								borderRadius: "20px",
								color: activeAttendanceSubTab === "take" ? "#fff" : "var(--text-secondary)",
								cursor: "pointer",
								fontWeight: "600",
								fontSize: "0.88rem",
								transition: "all 0.2s"
							},
							children: "Take Attendance"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 937,
							columnNumber: 13
						}, this), /* @__PURE__ */ _jsxDEV("button", {
							onClick: () => setActiveAttendanceSubTab("report"),
							style: {
								padding: "8px 18px",
								background: activeAttendanceSubTab === "report" ? "var(--primary)" : "transparent",
								border: "1px solid " + (activeAttendanceSubTab === "report" ? "var(--primary)" : "var(--border-color)"),
								borderRadius: "20px",
								color: activeAttendanceSubTab === "report" ? "#fff" : "var(--text-secondary)",
								cursor: "pointer",
								fontWeight: "600",
								fontSize: "0.88rem",
								transition: "all 0.2s"
							},
							children: "Attendance Report"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 953,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 936,
						columnNumber: 11
					}, this), activeAttendanceSubTab === "take" ? /* @__PURE__ */ _jsxDEV(_Fragment, { children: [
						/* @__PURE__ */ _jsxDEV("div", {
							style: {
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								marginBottom: "20px",
								flexWrap: "wrap",
								gap: "12px"
							},
							children: [/* @__PURE__ */ _jsxDEV("p", {
								style: {
									color: "var(--text-secondary)",
									fontSize: "0.9rem",
									margin: 0
								},
								children: "Select the date and mark each student's roll call status."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 974,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("div", {
								style: {
									display: "flex",
									gap: "12px",
									alignItems: "center"
								},
								className: "no-print",
								children: [/* @__PURE__ */ _jsxDEV("input", {
									type: "date",
									className: "form-control",
									style: { width: "170px" },
									value: attendanceDate,
									onChange: (e) => {
										setAttendanceDate(e.target.value);
										fetchAttendance(assignments.formClass.id, e.target.value);
									},
									min: !settings.allow_past_attendance ? new Date().toISOString().split("T")[0] : undefined,
									max: !settings.allow_past_attendance ? new Date().toISOString().split("T")[0] : undefined
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 976,
									columnNumber: 19
								}, this), /* @__PURE__ */ _jsxDEV("button", {
									className: "btn btn-primary",
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									onClick: handleSaveAttendance,
									children: [/* @__PURE__ */ _jsxDEV(Save, { size: 15 }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 985,
										columnNumber: 148
									}, this), " Save Attendance"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 985,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 975,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 973,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							style: {
								display: "flex",
								flexWrap: "wrap",
								gap: "15px",
								marginBottom: "20px"
							},
							className: "no-print",
							children: /* @__PURE__ */ _jsxDEV("input", {
								type: "text",
								className: "form-control",
								style: {
									maxWidth: "300px",
									padding: "10px"
								},
								placeholder: "Search student by name...",
								value: attendanceSearch,
								onChange: (e) => setAttendanceSearch(e.target.value)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 991,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 990,
							columnNumber: 15
						}, this),
						/* @__PURE__ */ _jsxDEV("div", {
							style: {
								overflowX: "auto",
								borderRadius: "10px",
								border: "1px solid var(--border-color)"
							},
							children: /* @__PURE__ */ _jsxDEV("table", {
								className: "school-table",
								style: {
									width: "100%",
									margin: 0
								},
								children: [/* @__PURE__ */ _jsxDEV("thead", {
									style: { backgroundColor: "#f8fafc" },
									children: /* @__PURE__ */ _jsxDEV("tr", { children: [
										/* @__PURE__ */ _jsxDEV("th", {
											style: { padding: "14px" },
											children: "Student Name"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1005,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ _jsxDEV("th", {
											style: { padding: "14px" },
											children: "Admission Number"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1006,
											columnNumber: 23
										}, this),
										/* @__PURE__ */ _jsxDEV("th", {
											style: { padding: "14px" },
											children: "Roll Call Status"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1007,
											columnNumber: 23
										}, this)
									] }, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1004,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1003,
									columnNumber: 19
								}, this), /* @__PURE__ */ _jsxDEV("tbody", { children: attendanceRoster.filter((r) => r.full_name.toLowerCase().includes(attendanceSearch.toLowerCase()) || r.admission_number.toLowerCase().includes(attendanceSearch.toLowerCase())).map((r, idx) => /* @__PURE__ */ _jsxDEV("tr", {
									style: {
										transition: "background-color 0.2s",
										borderBottom: "1px solid var(--border-color)"
									},
									onMouseEnter: (e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.01)",
									onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "transparent",
									children: [
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												fontWeight: "600",
												padding: "14px"
											},
											children: r.full_name
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1016,
											columnNumber: 25
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: { padding: "14px" },
											children: /* @__PURE__ */ _jsxDEV("code", {
												style: {
													backgroundColor: "var(--bg-secondary)",
													padding: "3px 8px",
													borderRadius: "4px",
													fontSize: "0.82rem"
												},
												children: r.admission_number
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1017,
												columnNumber: 57
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1017,
											columnNumber: 25
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: { padding: "14px" },
											children: /* @__PURE__ */ _jsxDEV("div", {
												style: {
													display: "flex",
													gap: "8px"
												},
												children: [
													/* @__PURE__ */ _jsxDEV("button", {
														type: "button",
														onClick: () => handleAttendanceChange(r.student_id, "present"),
														className: "btn",
														style: {
															padding: "6px 16px",
															fontSize: "0.8rem",
															backgroundColor: r.status === "present" || !r.status ? "#10b981" : "transparent",
															color: r.status === "present" || !r.status ? "#fff" : "#10b981",
															border: "1.5px solid #10b981",
															borderRadius: "20px",
															cursor: "pointer",
															fontWeight: "600",
															transition: "all 0.2s ease"
														},
														children: "â?? Present"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 1020,
														columnNumber: 29
													}, this),
													/* @__PURE__ */ _jsxDEV("button", {
														type: "button",
														onClick: () => handleAttendanceChange(r.student_id, "absent"),
														className: "btn",
														style: {
															padding: "6px 16px",
															fontSize: "0.8rem",
															backgroundColor: r.status === "absent" ? "#ef4444" : "transparent",
															color: r.status === "absent" ? "#fff" : "#ef4444",
															border: "1.5px solid #ef4444",
															borderRadius: "20px",
															cursor: "pointer",
															fontWeight: "600",
															transition: "all 0.2s ease"
														},
														children: "â?? Absent"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 1038,
														columnNumber: 29
													}, this),
													/* @__PURE__ */ _jsxDEV("button", {
														type: "button",
														onClick: () => handleAttendanceChange(r.student_id, "late"),
														className: "btn",
														style: {
															padding: "6px 16px",
															fontSize: "0.8rem",
															backgroundColor: r.status === "late" ? "#f59e0b" : "transparent",
															color: r.status === "late" ? "#fff" : "#f59e0b",
															border: "1.5px solid #f59e0b",
															borderRadius: "20px",
															cursor: "pointer",
															fontWeight: "600",
															transition: "all 0.2s ease"
														},
														children: "â° Late"
													}, void 0, false, {
														fileName: _jsxFileName,
														lineNumber: 1056,
														columnNumber: 29
													}, this)
												]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1019,
												columnNumber: 27
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1018,
											columnNumber: 25
										}, this)
									]
								}, idx, true, {
									fileName: _jsxFileName,
									lineNumber: 1015,
									columnNumber: 23
								}, this)) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1010,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1002,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1001,
							columnNumber: 15
						}, this)
					] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 972,
						columnNumber: 13
					}, this) : /* @__PURE__ */ _jsxDEV(_Fragment, { children: [/* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "flex-start",
							marginBottom: "20px",
							flexWrap: "wrap",
							gap: "12px"
						},
						children: [/* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "var(--text-secondary)",
								fontSize: "0.9rem",
								margin: 0
							},
							children: "Select a date range to view student attendance summary."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1085,
							columnNumber: 17
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							style: {
								display: "flex",
								flexWrap: "wrap",
								gap: "10px",
								alignItems: "center"
							},
							className: "no-print",
							children: [
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ _jsxDEV("span", {
										style: {
											fontSize: "0.8rem",
											fontWeight: "600",
											color: "var(--text-secondary)"
										},
										children: "From:"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1088,
										columnNumber: 21
									}, this), /* @__PURE__ */ _jsxDEV("input", {
										type: "date",
										className: "form-control",
										style: {
											width: "150px",
											padding: "6px"
										},
										value: attendanceReportStartDate,
										onChange: (e) => setAttendanceReportStartDate(e.target.value)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1089,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1087,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									children: [/* @__PURE__ */ _jsxDEV("span", {
										style: {
											fontSize: "0.8rem",
											fontWeight: "600",
											color: "var(--text-secondary)"
										},
										children: "To:"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1092,
										columnNumber: 21
									}, this), /* @__PURE__ */ _jsxDEV("input", {
										type: "date",
										className: "form-control",
										style: {
											width: "150px",
											padding: "6px"
										},
										value: attendanceReportEndDate,
										onChange: (e) => setAttendanceReportEndDate(e.target.value)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1093,
										columnNumber: 21
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1091,
									columnNumber: 19
								}, this),
								/* @__PURE__ */ _jsxDEV("button", {
									className: "btn btn-secondary no-print",
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									onClick: handleDownloadAttendancePDF,
									children: [/* @__PURE__ */ _jsxDEV(Download, { size: 15 }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1095,
										columnNumber: 166
									}, this), " Download PDF"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1095,
									columnNumber: 19
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1086,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1084,
						columnNumber: 15
					}, this), /* @__PURE__ */ _jsxDEV("div", {
						ref: attendanceReportRef,
						style: {
							overflowX: "auto",
							borderRadius: "10px",
							border: "1px solid var(--border-color)",
							backgroundColor: "#fff",
							padding: "10px"
						},
						children: /* @__PURE__ */ _jsxDEV("table", {
							className: "school-table",
							style: {
								width: "100%",
								margin: 0
							},
							children: [/* @__PURE__ */ _jsxDEV("thead", {
								style: { backgroundColor: "#f8fafc" },
								children: /* @__PURE__ */ _jsxDEV("tr", { children: [
									/* @__PURE__ */ _jsxDEV("th", {
										style: { padding: "14px" },
										children: "Student Name"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1102,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: { padding: "14px" },
										children: "Admission Number"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1103,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: {
											textAlign: "center",
											padding: "14px"
										},
										children: "Present"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1104,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: {
											textAlign: "center",
											padding: "14px"
										},
										children: "Absent"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1105,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: {
											textAlign: "center",
											padding: "14px"
										},
										children: "Late"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1106,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: {
											textAlign: "center",
											padding: "14px"
										},
										children: "Total Days"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1107,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: {
											textAlign: "center",
											padding: "14px"
										},
										children: "Attendance %"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1108,
										columnNumber: 23
									}, this)
								] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1101,
									columnNumber: 21
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1100,
								columnNumber: 19
							}, this), /* @__PURE__ */ _jsxDEV("tbody", { children: attendanceReport.length === 0 ? /* @__PURE__ */ _jsxDEV("tr", { children: /* @__PURE__ */ _jsxDEV("td", {
								colSpan: "7",
								style: {
									textAlign: "center",
									padding: "40px",
									color: "var(--text-muted)"
								},
								children: "No attendance records found for this period."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1114,
								columnNumber: 25
							}, this) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1113,
								columnNumber: 23
							}, this) : attendanceReport.map((r, idx) => {
								const ratio = r.total_days > 0 ? Math.round(r.present_count / r.total_days * 100) : 0;
								return /* @__PURE__ */ _jsxDEV("tr", {
									style: {
										transition: "background-color 0.2s",
										borderBottom: "1px solid var(--border-color)"
									},
									onMouseEnter: (e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.01)",
									onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "transparent",
									children: [
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												fontWeight: "600",
												padding: "14px"
											},
											children: r.full_name
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1121,
											columnNumber: 29
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: { padding: "14px" },
											children: /* @__PURE__ */ _jsxDEV("code", {
												style: {
													backgroundColor: "var(--bg-secondary)",
													padding: "3px 8px",
													borderRadius: "4px",
													fontSize: "0.82rem"
												},
												children: r.admission_number
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1122,
												columnNumber: 61
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1122,
											columnNumber: 29
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												textAlign: "center",
												padding: "14px"
											},
											children: /* @__PURE__ */ _jsxDEV("span", {
												style: {
													color: "#10b981",
													fontWeight: "700",
													fontSize: "1rem"
												},
												children: r.present_count
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1123,
												columnNumber: 82
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1123,
											columnNumber: 29
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												textAlign: "center",
												padding: "14px"
											},
											children: /* @__PURE__ */ _jsxDEV("span", {
												style: {
													color: "#ef4444",
													fontWeight: "700",
													fontSize: "1rem"
												},
												children: r.absent_count
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1124,
												columnNumber: 82
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1124,
											columnNumber: 29
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												textAlign: "center",
												padding: "14px"
											},
											children: /* @__PURE__ */ _jsxDEV("span", {
												style: {
													color: "#f59e0b",
													fontWeight: "700",
													fontSize: "1rem"
												},
												children: r.late_count
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1125,
												columnNumber: 82
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1125,
											columnNumber: 29
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												textAlign: "center",
												padding: "14px",
												fontWeight: "700"
											},
											children: r.total_days
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1126,
											columnNumber: 29
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												textAlign: "center",
												padding: "14px"
											},
											children: /* @__PURE__ */ _jsxDEV("div", {
												style: {
													display: "inline-flex",
													alignItems: "center",
													gap: "6px",
													padding: "5px 12px",
													borderRadius: "20px",
													fontSize: "0.82rem",
													fontWeight: "700",
													backgroundColor: ratio >= 80 ? "rgba(16,185,129,0.1)" : ratio >= 50 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
													color: ratio >= 80 ? "#10b981" : ratio >= 50 ? "#f59e0b" : "#ef4444"
												},
												children: [ratio, "%"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1128,
												columnNumber: 31
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1127,
											columnNumber: 29
										}, this)
									]
								}, idx, true, {
									fileName: _jsxFileName,
									lineNumber: 1120,
									columnNumber: 27
								}, this);
							}) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1111,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1099,
							columnNumber: 17
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 1098,
						columnNumber: 15
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1083,
						columnNumber: 13
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 934,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 921,
				columnNumber: 9
			}, this),
			activeSubTab === "broadsheet" && assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "0"
				},
				children: [/* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "15px",
						background: "linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)",
						padding: "24px",
						color: "white",
						boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
						borderRadius: "var(--radius-lg) var(--radius-lg) 0 0"
					},
					children: /* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "15px"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "48px",
								height: "48px",
								borderRadius: "50%",
								backgroundColor: "rgba(255,255,255,0.15)",
								backdropFilter: "blur(10px)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "2px solid rgba(255,255,255,0.4)"
							},
							children: /* @__PURE__ */ _jsxDEV(FileSpreadsheet, {
								size: 24,
								color: "white"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1158,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1157,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								fontSize: "1.25rem",
								fontWeight: "700"
							},
							children: ["Class Result â?? ", assignments.formClass.name]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1161,
							columnNumber: 17
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "rgba(255,255,255,0.85)",
								fontSize: "0.85rem",
								margin: "4px 0 0 0"
							},
							children: [
								settings.active_term,
								" Â· ",
								settings.active_session,
								" Â· Full broadsheet matrix"
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1162,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1160,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1156,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 1155,
					columnNumber: 11
				}, this), /* @__PURE__ */ _jsxDEV(ClassBroadsheet, {
					data: broadsheetData,
					className: assignments.formClass.name,
					term: settings.active_term,
					session: settings.active_session,
					settings
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 1169,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 1153,
				columnNumber: 9
			}, this),
			activeSubTab === "broadsheet" && !assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					padding: "28px",
					backgroundColor: "var(--bg-surface)"
				},
				children: /* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "40px",
						gap: "16px",
						textAlign: "center"
					},
					children: [
						/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "64px",
								height: "64px",
								borderRadius: "50%",
								backgroundColor: "rgba(59,130,246,0.1)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							},
							children: /* @__PURE__ */ _jsxDEV(FileSpreadsheet, {
								size: 32,
								style: { color: "var(--primary)" }
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1182,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1181,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								color: "var(--text-primary)"
							},
							children: "Class Results"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1184,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "var(--text-muted)",
								maxWidth: "400px",
								margin: 0
							},
							children: "You must be assigned as a Form Master to view class broadsheets."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1185,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 1180,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 1179,
				columnNumber: 9
			}, this),
			activeSubTab === "behavioral" && !assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					padding: "28px",
					backgroundColor: "var(--bg-surface)"
				},
				children: /* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "40px",
						gap: "16px",
						textAlign: "center"
					},
					children: [
						/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "64px",
								height: "64px",
								borderRadius: "50%",
								backgroundColor: "rgba(245,158,11,0.1)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							},
							children: /* @__PURE__ */ _jsxDEV(Award, {
								size: 32,
								style: { color: "#f59e0b" }
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1197,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1196,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								color: "var(--text-primary)"
							},
							children: "Behavioral Traits"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1199,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "var(--text-muted)",
								maxWidth: "400px",
								margin: 0
							},
							children: "You must be assigned as a Form Master to evaluate psychomotor traits."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1200,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 1195,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 1194,
				columnNumber: 9
			}, this),
			activeSubTab === "behavioral" && assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					backgroundColor: "var(--bg-surface)",
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "15px",
						background: "linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)",
						padding: "24px",
						color: "white",
						boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
					},
					children: /* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "15px"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "48px",
								height: "48px",
								borderRadius: "50%",
								backgroundColor: "rgba(255,255,255,0.15)",
								backdropFilter: "blur(10px)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "2px solid rgba(255,255,255,0.4)"
							},
							children: /* @__PURE__ */ _jsxDEV(Award, {
								size: 24,
								color: "white"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1210,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1209,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								fontSize: "1.25rem",
								fontWeight: "700"
							},
							children: "Behavioral Traits & Psychomotor Ratings"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1213,
							columnNumber: 17
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "rgba(255,255,255,0.85)",
								fontSize: "0.85rem",
								margin: "4px 0 0 0"
							},
							children: "Evaluate students on a scale of 1 (Poor) to 5 (Excellent)."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1214,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1212,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1208,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 1207,
					columnNumber: 11
				}, this), /* @__PURE__ */ _jsxDEV("div", {
					style: { padding: "24px" },
					children: !evaluatingStudent ? /* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							gap: "20px",
							flexWrap: "wrap",
							alignItems: "center",
							marginBottom: "20px"
						},
						children: /* @__PURE__ */ _jsxDEV("div", {
							style: { flex: "1 1 300px" },
							children: [/* @__PURE__ */ _jsxDEV("label", {
								style: {
									fontWeight: "700",
									marginBottom: "8px",
									display: "block",
									color: "var(--text-primary)",
									fontSize: "0.9rem"
								},
								children: "Select Student to Evaluate"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1222,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("select", {
								className: "form-control",
								onChange: (e) => {
									const stId = parseInt(e.target.value);
									if (!stId) return;
									const st = [...behavioralStudents.unrated, ...behavioralStudents.rated].find((s) => s.id === stId);
									if (st) handleSelectStudentForEval(st);
								},
								defaultValue: "",
								children: [
									/* @__PURE__ */ _jsxDEV("option", {
										value: "",
										disabled: true,
										children: "-- Select a student --"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1233,
										columnNumber: 19
									}, this),
									behavioralStudents.unrated.length > 0 && /* @__PURE__ */ _jsxDEV("optgroup", {
										label: "Not Evaluated Yet",
										children: behavioralStudents.unrated.map((s) => /* @__PURE__ */ _jsxDEV("option", {
											value: s.id,
											children: [
												s.full_name,
												" (",
												s.admission_number,
												")"
											]
										}, s.id, true, {
											fileName: _jsxFileName,
											lineNumber: 1237,
											columnNumber: 25
										}, this))
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1235,
										columnNumber: 21
									}, this),
									behavioralStudents.rated.length > 0 && /* @__PURE__ */ _jsxDEV("optgroup", {
										label: "Already Evaluated",
										children: behavioralStudents.rated.map((s) => /* @__PURE__ */ _jsxDEV("option", {
											value: s.id,
											children: [
												s.full_name,
												" (",
												s.admission_number,
												") â??"
											]
										}, s.id, true, {
											fileName: _jsxFileName,
											lineNumber: 1244,
											columnNumber: 25
										}, this))
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1242,
										columnNumber: 21
									}, this)
								]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1223,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1221,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 1220,
						columnNumber: 13
					}, this) : /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "20px"
						},
						children: [/* @__PURE__ */ _jsxDEV("h4", {
							style: { margin: 0 },
							children: ["Evaluating: ", /* @__PURE__ */ _jsxDEV("span", {
								style: { color: "var(--primary)" },
								children: evaluatingStudent.full_name
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1254,
								columnNumber: 55
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1254,
							columnNumber: 17
						}, this), /* @__PURE__ */ _jsxDEV("button", {
							className: "btn btn-secondary",
							style: {
								padding: "4px 12px",
								fontSize: "0.8rem"
							},
							onClick: () => setEvaluatingStudent(null),
							children: "Cancel / Back"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1255,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1253,
						columnNumber: 15
					}, this), /* @__PURE__ */ _jsxDEV("form", {
						onSubmit: handleSaveSkillEvaluation,
						children: [
							/* @__PURE__ */ _jsxDEV("div", {
								style: {
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
									gap: "20px"
								},
								children: skillsList.map((skill) => /* @__PURE__ */ _jsxDEV("div", {
									style: {
										border: "1px solid var(--border-color)",
										padding: "12px",
										borderRadius: "6px",
										backgroundColor: "#f8fafc"
									},
									children: [/* @__PURE__ */ _jsxDEV("label", {
										style: {
											display: "block",
											fontWeight: "bold",
											marginBottom: "10px"
										},
										children: [skill.name, /* @__PURE__ */ _jsxDEV("span", {
											className: "badge",
											style: {
												float: "right",
												fontSize: "0.7rem",
												backgroundColor: skill.category === "AFFECTIVE" ? "#e0f2fe" : "#fef3c7",
												color: skill.category === "AFFECTIVE" ? "#075985" : "#92400e"
											},
											children: skill.category
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1264,
											columnNumber: 25
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1262,
										columnNumber: 23
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										style: {
											display: "flex",
											justifyContent: "space-between",
											padding: "0 10px"
										},
										children: [
											1,
											2,
											3,
											4,
											5
										].map((rating) => /* @__PURE__ */ _jsxDEV("label", {
											style: {
												display: "flex",
												flexDirection: "column",
												alignItems: "center",
												cursor: "pointer"
											},
											children: [/* @__PURE__ */ _jsxDEV("input", {
												type: "radio",
												name: `skill_${skill.id}_${skill.category}`,
												value: rating,
												checked: skillRatings[`${skill.id}_${skill.category}`] === rating,
												onChange: () => setSkillRatings((prev) => ({
													...prev,
													[`${skill.id}_${skill.category}`]: rating
												})),
												required: true
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1269,
												columnNumber: 29
											}, this), /* @__PURE__ */ _jsxDEV("span", {
												style: {
													fontSize: "0.85rem",
													marginTop: "6px",
													fontWeight: skillRatings[`${skill.id}_${skill.category}`] === rating ? "bold" : "normal"
												},
												children: rating
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1277,
												columnNumber: 29
											}, this)]
										}, rating, true, {
											fileName: _jsxFileName,
											lineNumber: 1268,
											columnNumber: 27
										}, this))
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1266,
										columnNumber: 23
									}, this)]
								}, skill.id, true, {
									fileName: _jsxFileName,
									lineNumber: 1261,
									columnNumber: 21
								}, this))
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1259,
								columnNumber: 17
							}, this),
							skillsList.length === 0 && /* @__PURE__ */ _jsxDEV("p", {
								style: {
									color: "var(--danger)",
									marginTop: "10px"
								},
								children: "No skills configured by admin yet."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1285,
								columnNumber: 45
							}, this),
							/* @__PURE__ */ _jsxDEV("div", {
								style: {
									marginTop: "20px",
									display: "flex",
									justifyContent: "flex-end"
								},
								children: /* @__PURE__ */ _jsxDEV("button", {
									type: "submit",
									className: "btn btn-primary",
									style: {
										display: "flex",
										alignItems: "center",
										gap: "6px"
									},
									disabled: skillsList.length === 0,
									children: [/* @__PURE__ */ _jsxDEV(Save, { size: 15 }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1289,
										columnNumber: 21
									}, this), " Save Evaluation"]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1288,
									columnNumber: 19
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1287,
								columnNumber: 17
							}, this)
						]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1258,
						columnNumber: 15
					}, this)] }, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1252,
						columnNumber: 13
					}, this)
				}, void 0, false, {
					fileName: _jsxFileName,
					lineNumber: 1218,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 1205,
				columnNumber: 9
			}, this),
			activeSubTab === "schemes" && /* @__PURE__ */ _jsxDEV("div", {
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "0"
				},
				children: [
					/* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "15px",
							background: "linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)",
							padding: "24px",
							color: "white",
							boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
							borderRadius: "var(--radius-lg) var(--radius-lg) 0 0"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "15px"
							},
							children: [/* @__PURE__ */ _jsxDEV("div", {
								style: {
									width: "48px",
									height: "48px",
									borderRadius: "50%",
									backgroundColor: "rgba(255,255,255,0.15)",
									backdropFilter: "blur(10px)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									border: "2px solid rgba(255,255,255,0.4)"
								},
								children: /* @__PURE__ */ _jsxDEV(BookOpen, {
									size: 24,
									color: "white"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1308,
									columnNumber: 17
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1307,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
								style: {
									margin: 0,
									fontSize: "1.25rem",
									fontWeight: "700"
								},
								children: "Scheme of Work"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1311,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("p", {
								style: {
									color: "rgba(255,255,255,0.85)",
									fontSize: "0.85rem",
									margin: "4px 0 0 0"
								},
								children: "Review and update the weekly course outline for your assigned subjects."
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1312,
								columnNumber: 17
							}, this)] }, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1310,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1306,
							columnNumber: 13
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							style: {
								display: "flex",
								gap: "10px",
								alignItems: "center"
							},
							children: teacherSchemeAssignIdx !== "" && /* @__PURE__ */ _jsxDEV("button", {
								className: "btn no-print",
								onClick: handleDownloadSchemePDF,
								style: {
									display: "flex",
									alignItems: "center",
									gap: "8px",
									backgroundColor: "rgba(255,255,255,0.2)",
									backdropFilter: "blur(5px)",
									border: "1.5px solid rgba(255,255,255,0.5)",
									color: "white",
									padding: "10px 20px",
									borderRadius: "20px",
									fontWeight: "700",
									cursor: "pointer",
									transition: "all 0.2s"
								},
								onMouseEnter: (e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)",
								onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)",
								children: [/* @__PURE__ */ _jsxDEV(Download, { size: 15 }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1324,
									columnNumber: 19
								}, this), " Download PDF"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1317,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1315,
							columnNumber: 13
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1305,
						columnNumber: 11
					}, this),
					/* @__PURE__ */ _jsxDEV("div", {
						className: "glass-panel",
						style: {
							padding: "20px",
							backgroundColor: "var(--bg-surface)",
							borderRadius: "0",
							borderTop: "none"
						},
						children: /* @__PURE__ */ _jsxDEV("div", {
							style: {
								display: "flex",
								gap: "12px",
								flexWrap: "wrap"
							},
							children: [/* @__PURE__ */ _jsxDEV("div", {
								className: "form-group",
								style: {
									margin: 0,
									flex: "1 1 200px"
								},
								children: [/* @__PURE__ */ _jsxDEV("label", {
									style: {
										fontSize: "0.8rem",
										fontWeight: "600",
										color: "var(--text-secondary)",
										textTransform: "uppercase",
										letterSpacing: "0.04em"
									},
									children: "Select Subject"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1334,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("select", {
									className: "form-control",
									value: teacherSchemeAssignIdx,
									onChange: (e) => setTeacherSchemeAssignIdx(e.target.value),
									children: [/* @__PURE__ */ _jsxDEV("option", {
										value: "",
										children: "Choose assigned subject..."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1340,
										columnNumber: 19
									}, this), assignments.subjects.map((assign, idx) => /* @__PURE__ */ _jsxDEV("option", {
										value: idx,
										children: [
											assign.subject_name,
											" - ",
											assign.class_name
										]
									}, idx, true, {
										fileName: _jsxFileName,
										lineNumber: 1342,
										columnNumber: 21
									}, this))]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1335,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1333,
								columnNumber: 15
							}, this), /* @__PURE__ */ _jsxDEV("div", {
								className: "form-group",
								style: {
									margin: 0,
									flex: "1 1 150px"
								},
								children: [/* @__PURE__ */ _jsxDEV("label", {
									style: {
										fontSize: "0.8rem",
										fontWeight: "600",
										color: "var(--text-secondary)",
										textTransform: "uppercase",
										letterSpacing: "0.04em"
									},
									children: "Term"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1347,
									columnNumber: 17
								}, this), /* @__PURE__ */ _jsxDEV("select", {
									className: "form-control",
									value: teacherSchemeTerm,
									onChange: (e) => setTeacherSchemeTerm(e.target.value),
									children: [
										/* @__PURE__ */ _jsxDEV("option", {
											value: "1st Term",
											children: "1st Term"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1353,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ _jsxDEV("option", {
											value: "2nd Term",
											children: "2nd Term"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1354,
											columnNumber: 19
										}, this),
										/* @__PURE__ */ _jsxDEV("option", {
											value: "3rd Term",
											children: "3rd Term"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1355,
											columnNumber: 19
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1348,
									columnNumber: 17
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1346,
								columnNumber: 15
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1332,
							columnNumber: 13
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 1331,
						columnNumber: 11
					}, this),
					teacherSchemeAssignIdx === "" ? /* @__PURE__ */ _jsxDEV("div", {
						className: "glass-panel",
						style: {
							padding: "40px",
							backgroundColor: "var(--bg-surface)",
							textAlign: "center",
							borderRadius: "0 0 var(--radius-lg) var(--radius-lg)"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "64px",
								height: "64px",
								borderRadius: "50%",
								backgroundColor: "rgba(99,102,241,0.1)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto 16px"
							},
							children: /* @__PURE__ */ _jsxDEV(BookOpen, {
								size: 32,
								style: { color: "#6366f1" }
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1365,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1364,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "var(--text-muted)",
								fontSize: "0.95rem",
								margin: 0
							},
							children: "Select a subject above to load the scheme of work."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1367,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1363,
						columnNumber: 13
					}, this) : /* @__PURE__ */ _jsxDEV("div", {
						ref: schemeReportRef,
						className: "glass-panel",
						style: {
							backgroundColor: "#fff",
							overflow: "hidden",
							borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
							borderTop: "none",
							padding: "10px"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", {
							style: {
								padding: "16px 24px",
								borderBottom: "1px solid var(--border-color)",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								flexWrap: "wrap",
								gap: "8px",
								background: "linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(30,58,138,0.04) 100%)"
							},
							children: [/* @__PURE__ */ _jsxDEV("div", {
								style: {
									display: "flex",
									alignItems: "center",
									gap: "12px"
								},
								children: [/* @__PURE__ */ _jsxDEV("div", {
									style: {
										width: "36px",
										height: "36px",
										borderRadius: "50%",
										backgroundColor: "var(--primary)",
										color: "#fff",
										display: "flex",
										alignItems: "center",
										justifyContent: "center"
									},
									children: /* @__PURE__ */ _jsxDEV(BookOpen, { size: 18 }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1388,
										columnNumber: 21
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1383,
									columnNumber: 19
								}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("div", {
									style: {
										fontWeight: "700",
										fontSize: "0.95rem",
										color: "var(--primary)"
									},
									children: assignments.subjects[teacherSchemeAssignIdx]?.subject_name || "Subject"
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1391,
									columnNumber: 21
								}, this), /* @__PURE__ */ _jsxDEV("div", {
									style: {
										fontSize: "0.78rem",
										color: "var(--text-secondary)"
									},
									children: [
										assignments.subjects[teacherSchemeAssignIdx]?.class_name || "Class",
										" Â· ",
										teacherSchemeTerm
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1394,
									columnNumber: 21
								}, this)] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1390,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1382,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("span", {
								style: {
									padding: "4px 12px",
									borderRadius: "20px",
									fontSize: "0.78rem",
									fontWeight: "600",
									backgroundColor: "var(--success-light)",
									color: "var(--success)"
								},
								children: [teacherSchemeWeeks.filter((w) => w.topic).length, " / 12 Weeks Filled"]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1399,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1372,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("div", {
							className: "table-container",
							style: {
								margin: 0,
								borderRadius: 0
							},
							children: /* @__PURE__ */ _jsxDEV("table", {
								className: "school-table",
								style: { margin: 0 },
								children: [/* @__PURE__ */ _jsxDEV("thead", { children: /* @__PURE__ */ _jsxDEV("tr", { children: [
									/* @__PURE__ */ _jsxDEV("th", {
										style: {
											width: "70px",
											textAlign: "center"
										},
										children: "Week"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1409,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: { width: "38%" },
										children: "Title & Subtitle"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1410,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", { children: "Content / Objectives" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1411,
										columnNumber: 23
									}, this)
								] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1408,
									columnNumber: 21
								}, this) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1407,
									columnNumber: 19
								}, this), /* @__PURE__ */ _jsxDEV("tbody", { children: teacherSchemeWeeks.map((w, idx) => /* @__PURE__ */ _jsxDEV("tr", {
									style: { backgroundColor: w.topic ? "transparent" : "rgba(255,59,48,0.03)" },
									children: [
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												textAlign: "center",
												verticalAlign: "top",
												paddingTop: "14px"
											},
											children: /* @__PURE__ */ _jsxDEV("span", {
												style: {
													display: "inline-flex",
													alignItems: "center",
													justifyContent: "center",
													width: "32px",
													height: "32px",
													borderRadius: "50%",
													backgroundColor: w.topic ? "var(--primary)" : "var(--border-color)",
													color: w.topic ? "#fff" : "var(--text-muted)",
													fontWeight: "700",
													fontSize: "0.8rem"
												},
												children: w.week
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1418,
												columnNumber: 27
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1417,
											columnNumber: 25
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												padding: "12px 14px",
												verticalAlign: "top"
											},
											children: w.topic ? /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("div", {
												style: {
													fontWeight: "700",
													fontSize: "0.92rem",
													color: "var(--text-primary)"
												},
												children: w.topic
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1429,
												columnNumber: 31
											}, this), w.subtitle && /* @__PURE__ */ _jsxDEV("div", {
												style: {
													fontSize: "0.8rem",
													color: "var(--primary)",
													marginTop: "3px",
													fontWeight: "500"
												},
												children: ["ð??? ", w.subtitle]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1431,
												columnNumber: 33
											}, this)] }, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1428,
												columnNumber: 29
											}, this) : /* @__PURE__ */ _jsxDEV("span", {
												style: { color: "var(--text-muted)" },
												children: "Not specified"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1437,
												columnNumber: 29
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1426,
											columnNumber: 25
										}, this),
										/* @__PURE__ */ _jsxDEV("td", {
											style: {
												padding: "12px 14px",
												fontSize: "0.88rem",
												verticalAlign: "top",
												whiteSpace: "pre-line"
											},
											children: w.objectives || /* @__PURE__ */ _jsxDEV("span", {
												style: { color: "var(--text-muted)" },
												children: "Not specified"
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1441,
												columnNumber: 44
											}, this)
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1440,
											columnNumber: 25
										}, this)
									]
								}, idx, true, {
									fileName: _jsxFileName,
									lineNumber: 1416,
									columnNumber: 23
								}, this)) }, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1414,
									columnNumber: 19
								}, this)]
							}, void 0, true, {
								fileName: _jsxFileName,
								lineNumber: 1406,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1405,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1370,
						columnNumber: 13
					}, this)
				]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 1303,
				columnNumber: 9
			}, this),
			activeSubTab === "students" && !assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					padding: "28px",
					backgroundColor: "var(--bg-surface)"
				},
				children: /* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "40px",
						gap: "16px",
						textAlign: "center"
					},
					children: [
						/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "64px",
								height: "64px",
								borderRadius: "50%",
								backgroundColor: "rgba(59,130,246,0.1)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center"
							},
							children: /* @__PURE__ */ _jsxDEV(Users, {
								size: 32,
								style: { color: "var(--primary)" }
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1459,
								columnNumber: 15
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1458,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h3", {
							style: { margin: 0 },
							children: "My Students"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1461,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "var(--text-muted)",
								maxWidth: "400px",
								margin: 0
							},
							children: "You must be assigned as a Form Master to view your class students."
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1462,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 1457,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 1456,
				columnNumber: 9
			}, this),
			activeSubTab === "students" && assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				className: "glass-panel",
				style: {
					backgroundColor: "var(--bg-surface)",
					overflow: "hidden"
				},
				children: [/* @__PURE__ */ _jsxDEV("div", {
					style: {
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						flexWrap: "wrap",
						gap: "15px",
						background: "linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)",
						padding: "24px",
						color: "white",
						boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
					},
					children: [/* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "15px"
						},
						children: [/* @__PURE__ */ _jsxDEV("div", {
							style: {
								width: "48px",
								height: "48px",
								borderRadius: "50%",
								backgroundColor: "rgba(255,255,255,0.15)",
								backdropFilter: "blur(10px)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "2px solid rgba(255,255,255,0.4)"
							},
							children: /* @__PURE__ */ _jsxDEV(Users, {
								size: 24,
								color: "white"
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1473,
								columnNumber: 17
							}, this)
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1472,
							columnNumber: 15
						}, this), /* @__PURE__ */ _jsxDEV("div", { children: [/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								margin: 0,
								fontSize: "1.25rem",
								fontWeight: "700"
							},
							children: ["My Students â?? ", assignments.formClass.name]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1476,
							columnNumber: 17
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "rgba(255,255,255,0.85)",
								fontSize: "0.85rem",
								margin: "4px 0 0 0"
							},
							children: [
								formClassStudents.length,
								" student",
								formClassStudents.length !== 1 ? "s" : "",
								" enrolled in your class"
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1477,
							columnNumber: 17
						}, this)] }, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1475,
							columnNumber: 15
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1471,
						columnNumber: 13
					}, this), settings.allow_fm_register_student === 1 ? /* @__PURE__ */ _jsxDEV("button", {
						className: "btn",
						onClick: () => setShowStudentModal(true),
						style: {
							display: "flex",
							alignItems: "center",
							gap: "8px",
							backgroundColor: "rgba(255,255,255,0.2)",
							backdropFilter: "blur(5px)",
							border: "1.5px solid rgba(255,255,255,0.5)",
							color: "white",
							padding: "10px 20px",
							borderRadius: "20px",
							fontWeight: "700",
							cursor: "pointer",
							transition: "all 0.2s"
						},
						onMouseEnter: (e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.3)",
						onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)",
						children: [/* @__PURE__ */ _jsxDEV(Plus, { size: 16 }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1491,
							columnNumber: 17
						}, this), " Register New Student"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1484,
						columnNumber: 15
					}, this) : /* @__PURE__ */ _jsxDEV("div", {
						style: {
							display: "flex",
							alignItems: "center",
							gap: "6px",
							backgroundColor: "rgba(0,0,0,0.15)",
							borderRadius: "20px",
							padding: "8px 16px",
							fontSize: "0.82rem",
							color: "rgba(255,255,255,0.6)",
							border: "1px dashed rgba(255,255,255,0.3)"
						},
						children: [/* @__PURE__ */ _jsxDEV(Lock, { size: 14 }, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1495,
							columnNumber: 17
						}, this), " Registration disabled by admin"]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1494,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 1470,
					columnNumber: 11
				}, this), /* @__PURE__ */ _jsxDEV("div", {
					style: { padding: "24px" },
					children: [/* @__PURE__ */ _jsxDEV("div", {
						style: { marginBottom: "20px" },
						children: /* @__PURE__ */ _jsxDEV("div", {
							style: {
								position: "relative",
								maxWidth: "360px"
							},
							children: [/* @__PURE__ */ _jsxDEV(Search, {
								size: 16,
								style: {
									position: "absolute",
									left: "12px",
									top: "50%",
									transform: "translateY(-50%)",
									color: "var(--text-muted)"
								}
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1504,
								columnNumber: 17
							}, this), /* @__PURE__ */ _jsxDEV("input", {
								type: "text",
								className: "form-control",
								placeholder: "Search by name or admission number...",
								value: studentSearch,
								onChange: (e) => setStudentSearch(e.target.value),
								style: { paddingLeft: "36px" }
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1505,
								columnNumber: 17
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1503,
							columnNumber: 15
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 1502,
						columnNumber: 13
					}, this), studentsLoading ? /* @__PURE__ */ _jsxDEV("div", {
						style: {
							textAlign: "center",
							padding: "40px",
							color: "var(--text-muted)"
						},
						children: "Loading studentsâ?¦"
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 1518,
						columnNumber: 15
					}, this) : formClassStudents.length === 0 ? /* @__PURE__ */ _jsxDEV("div", {
						style: {
							textAlign: "center",
							padding: "40px",
							color: "var(--text-muted)"
						},
						children: [/* @__PURE__ */ _jsxDEV(Users, {
							size: 40,
							style: {
								opacity: .3,
								marginBottom: "12px"
							}
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1521,
							columnNumber: 17
						}, this), /* @__PURE__ */ _jsxDEV("p", {
							style: { margin: 0 },
							children: [
								"No students enrolled in ",
								assignments.formClass.name,
								" yet."
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1522,
							columnNumber: 17
						}, this)]
					}, void 0, true, {
						fileName: _jsxFileName,
						lineNumber: 1520,
						columnNumber: 15
					}, this) : /* @__PURE__ */ _jsxDEV("div", {
						style: {
							overflowX: "auto",
							borderRadius: "10px",
							border: "1px solid var(--border-color)"
						},
						children: /* @__PURE__ */ _jsxDEV("table", {
							className: "school-table",
							style: {
								width: "100%",
								margin: 0
							},
							children: [/* @__PURE__ */ _jsxDEV("thead", {
								style: { backgroundColor: "#f8fafc" },
								children: /* @__PURE__ */ _jsxDEV("tr", { children: [
									/* @__PURE__ */ _jsxDEV("th", {
										style: { padding: "14px" },
										children: "#"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1529,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: { padding: "14px" },
										children: "Student Name"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1530,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: { padding: "14px" },
										children: "Admission No."
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1531,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: { padding: "14px" },
										children: "Gender"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1532,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: { padding: "14px" },
										children: "Date of Birth"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1533,
										columnNumber: 23
									}, this),
									/* @__PURE__ */ _jsxDEV("th", {
										style: {
											padding: "14px",
											textAlign: "center"
										},
										children: "Actions"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1534,
										columnNumber: 23
									}, this)
								] }, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1528,
									columnNumber: 21
								}, this)
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1527,
								columnNumber: 19
							}, this), /* @__PURE__ */ _jsxDEV("tbody", { children: formClassStudents.filter((s) => s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) || (s.admission_number || "").toLowerCase().includes(studentSearch.toLowerCase())).map((s, idx) => /* @__PURE__ */ _jsxDEV("tr", {
								style: {
									transition: "background-color 0.2s",
									borderBottom: "1px solid var(--border-color)"
								},
								onMouseEnter: (e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.01)",
								onMouseLeave: (e) => e.currentTarget.style.backgroundColor = "transparent",
								children: [
									/* @__PURE__ */ _jsxDEV("td", {
										style: {
											padding: "14px",
											color: "var(--text-muted)",
											fontWeight: "600"
										},
										children: idx + 1
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1550,
										columnNumber: 25
									}, this),
									/* @__PURE__ */ _jsxDEV("td", {
										style: { padding: "14px" },
										children: /* @__PURE__ */ _jsxDEV("div", {
											style: {
												display: "flex",
												alignItems: "center",
												gap: "12px"
											},
											children: [/* @__PURE__ */ _jsxDEV("div", {
												style: {
													width: "38px",
													height: "38px",
													borderRadius: "50%",
													overflow: "hidden",
													flexShrink: 0,
													backgroundColor: "var(--bg-secondary)",
													border: "2px solid var(--border-color)",
													display: "flex",
													alignItems: "center",
													justifyContent: "center"
												},
												children: s.passport_photo ? /* @__PURE__ */ _jsxDEV("img", {
													src: s.passport_photo,
													alt: s.full_name,
													style: {
														width: "100%",
														height: "100%",
														objectFit: "cover"
													}
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1559,
													columnNumber: 35
												}, this) : /* @__PURE__ */ _jsxDEV(Users, {
													size: 18,
													style: { color: "var(--text-muted)" }
												}, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1560,
													columnNumber: 35
												}, this)
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1553,
												columnNumber: 29
											}, this), /* @__PURE__ */ _jsxDEV("span", {
												style: {
													fontWeight: "600",
													color: "var(--text-primary)"
												},
												children: s.full_name
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1563,
												columnNumber: 29
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1552,
											columnNumber: 27
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1551,
										columnNumber: 25
									}, this),
									/* @__PURE__ */ _jsxDEV("td", {
										style: { padding: "14px" },
										children: /* @__PURE__ */ _jsxDEV("code", {
											style: {
												backgroundColor: "var(--bg-secondary)",
												padding: "3px 8px",
												borderRadius: "4px",
												fontSize: "0.82rem"
											},
											children: s.admission_number || "â??"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1567,
											columnNumber: 27
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1566,
										columnNumber: 25
									}, this),
									/* @__PURE__ */ _jsxDEV("td", {
										style: { padding: "14px" },
										children: /* @__PURE__ */ _jsxDEV("span", {
											style: {
												padding: "4px 10px",
												borderRadius: "20px",
												fontSize: "0.78rem",
												fontWeight: "600",
												backgroundColor: s.sex === "Female" ? "rgba(236,72,153,0.1)" : "rgba(59,130,246,0.1)",
												color: s.sex === "Female" ? "#db2777" : "#2563eb"
											},
											children: s.sex || "â??"
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1570,
											columnNumber: 27
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1569,
										columnNumber: 25
									}, this),
									/* @__PURE__ */ _jsxDEV("td", {
										style: {
											padding: "14px",
											color: "var(--text-secondary)"
										},
										children: s.date_of_birth || "â??"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1576,
										columnNumber: 25
									}, this),
									/* @__PURE__ */ _jsxDEV("td", {
										style: {
											padding: "14px",
											textAlign: "center"
										},
										children: /* @__PURE__ */ _jsxDEV("div", {
											style: {
												display: "flex",
												gap: "8px",
												justifyContent: "center"
											},
											children: [/* @__PURE__ */ _jsxDEV("button", {
												onClick: () => setViewingStudent(s),
												title: "View Profile",
												style: {
													padding: "6px 12px",
													borderRadius: "8px",
													border: "1px solid var(--border-color)",
													backgroundColor: "var(--bg-secondary)",
													cursor: "pointer",
													display: "flex",
													alignItems: "center",
													gap: "5px",
													fontSize: "0.8rem",
													fontWeight: "600",
													color: "var(--text-secondary)",
													transition: "all 0.2s"
												},
												children: [/* @__PURE__ */ _jsxDEV(Eye, { size: 14 }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1584,
													columnNumber: 31
												}, this), " View"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1579,
												columnNumber: 29
											}, this), settings.allow_fm_edit_student === 1 && /* @__PURE__ */ _jsxDEV("button", {
												onClick: () => setViewingStudent(s),
												title: "Edit Student",
												style: {
													padding: "6px 12px",
													borderRadius: "8px",
													border: "1px solid rgba(59,130,246,0.3)",
													backgroundColor: "rgba(59,130,246,0.08)",
													cursor: "pointer",
													display: "flex",
													alignItems: "center",
													gap: "5px",
													fontSize: "0.8rem",
													fontWeight: "600",
													color: "#2563eb",
													transition: "all 0.2s"
												},
												children: [/* @__PURE__ */ _jsxDEV(Edit3, { size: 14 }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1592,
													columnNumber: 33
												}, this), " Edit"]
											}, void 0, true, {
												fileName: _jsxFileName,
												lineNumber: 1587,
												columnNumber: 31
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1578,
											columnNumber: 27
										}, this)
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1577,
										columnNumber: 25
									}, this)
								]
							}, s.id, true, {
								fileName: _jsxFileName,
								lineNumber: 1544,
								columnNumber: 23
							}, this)) }, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1537,
								columnNumber: 19
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1526,
							columnNumber: 17
						}, this)
					}, void 0, false, {
						fileName: _jsxFileName,
						lineNumber: 1525,
						columnNumber: 15
					}, this)]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 1500,
					columnNumber: 11
				}, this)]
			}, void 0, true, {
				fileName: _jsxFileName,
				lineNumber: 1468,
				columnNumber: 9
			}, this),
			showStudentModal && assignments.formClass && /* @__PURE__ */ _jsxDEV("div", {
				className: "modal-overlay",
				children: /* @__PURE__ */ _jsxDEV("div", {
					className: "modal-content glass-panel",
					style: {
						backgroundColor: "var(--bg-surface)",
						maxWidth: "540px",
						width: "95%"
					},
					children: [
						/* @__PURE__ */ _jsxDEV("button", {
							className: "modal-close",
							onClick: () => setShowStudentModal(false),
							children: "â??"
						}, void 0, false, {
							fileName: _jsxFileName,
							lineNumber: 1613,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("h3", {
							style: {
								display: "flex",
								alignItems: "center",
								gap: "8px",
								marginBottom: "6px"
							},
							children: [/* @__PURE__ */ _jsxDEV(Plus, {
								size: 20,
								style: { color: "var(--primary)" }
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1615,
								columnNumber: 15
							}, this), " Register New Student"]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1614,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("p", {
							style: {
								color: "var(--text-secondary)",
								fontSize: "0.85rem",
								marginBottom: "20px"
							},
							children: ["Registering into: ", /* @__PURE__ */ _jsxDEV("strong", {
								style: { color: "var(--primary)" },
								children: assignments.formClass.name
							}, void 0, false, {
								fileName: _jsxFileName,
								lineNumber: 1618,
								columnNumber: 33
							}, this)]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1617,
							columnNumber: 13
						}, this),
						/* @__PURE__ */ _jsxDEV("form", {
							onSubmit: handleRegisterStudent,
							style: {
								display: "flex",
								flexDirection: "column",
								gap: "14px"
							},
							children: [
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr 1fr",
										gap: "14px"
									},
									children: [
										/* @__PURE__ */ _jsxDEV("div", {
											className: "form-group",
											style: { margin: 0 },
											children: [/* @__PURE__ */ _jsxDEV("label", { children: "Surname *" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1623,
												columnNumber: 19
											}, this), /* @__PURE__ */ _jsxDEV("input", {
												type: "text",
												className: "form-control",
												required: true,
												value: studentForm.surname,
												onChange: (e) => {
													const newSurname = e.target.value;
													const computedFullname = `${newSurname} ${studentForm.first_name} ${studentForm.other_names}`.replace(/\s+/g, " ").trim();
													setStudentForm({
														...studentForm,
														surname: newSurname,
														full_name: computedFullname
													});
												}
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1624,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1622,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ _jsxDEV("div", {
											className: "form-group",
											style: { margin: 0 },
											children: [/* @__PURE__ */ _jsxDEV("label", { children: "First Name *" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1631,
												columnNumber: 19
											}, this), /* @__PURE__ */ _jsxDEV("input", {
												type: "text",
												className: "form-control",
												required: true,
												value: studentForm.first_name,
												onChange: (e) => {
													const newFirstname = e.target.value;
													const computedFullname = `${studentForm.surname} ${newFirstname} ${studentForm.other_names}`.replace(/\s+/g, " ").trim();
													setStudentForm({
														...studentForm,
														first_name: newFirstname,
														full_name: computedFullname
													});
												}
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1632,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1630,
											columnNumber: 17
										}, this),
										/* @__PURE__ */ _jsxDEV("div", {
											className: "form-group",
											style: { margin: 0 },
											children: [/* @__PURE__ */ _jsxDEV("label", { children: "Other Names" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1639,
												columnNumber: 19
											}, this), /* @__PURE__ */ _jsxDEV("input", {
												type: "text",
												className: "form-control",
												value: studentForm.other_names,
												onChange: (e) => {
													const newOthernames = e.target.value;
													const computedFullname = `${studentForm.surname} ${studentForm.first_name} ${newOthernames}`.replace(/\s+/g, " ").trim();
													setStudentForm({
														...studentForm,
														other_names: newOthernames,
														full_name: computedFullname
													});
												}
											}, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1640,
												columnNumber: 19
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1638,
											columnNumber: 17
										}, this)
									]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1621,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr",
										gap: "14px"
									},
									children: /* @__PURE__ */ _jsxDEV("div", {
										className: "form-group",
										style: { margin: 0 },
										children: [/* @__PURE__ */ _jsxDEV("label", { children: "Display Full Name" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1649,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("input", {
											type: "text",
											className: "form-control",
											required: true,
											readOnly: true,
											style: { backgroundColor: "var(--bg-secondary)" },
											value: studentForm.full_name
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1650,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1648,
										columnNumber: 17
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1647,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr",
										gap: "14px"
									},
									children: /* @__PURE__ */ _jsxDEV("div", {
										className: "form-group",
										style: { margin: 0 },
										children: [/* @__PURE__ */ _jsxDEV("label", { children: "Date of Birth" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1655,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("input", {
											type: "date",
											className: "form-control",
											value: studentForm.date_of_birth,
											onChange: (e) => setStudentForm({
												...studentForm,
												date_of_birth: e.target.value
											})
										}, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1656,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1654,
										columnNumber: 17
									}, this)
								}, void 0, false, {
									fileName: _jsxFileName,
									lineNumber: 1653,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: "14px"
									},
									children: [/* @__PURE__ */ _jsxDEV("div", {
										className: "form-group",
										style: { margin: 0 },
										children: [/* @__PURE__ */ _jsxDEV("label", { children: "Gender" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1661,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("select", {
											className: "form-control",
											value: studentForm.sex,
											onChange: (e) => setStudentForm({
												...studentForm,
												sex: e.target.value
											}),
											children: [/* @__PURE__ */ _jsxDEV("option", { children: "Male" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1663,
												columnNumber: 21
											}, this), /* @__PURE__ */ _jsxDEV("option", { children: "Female" }, void 0, false, {
												fileName: _jsxFileName,
												lineNumber: 1664,
												columnNumber: 21
											}, this)]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1662,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1660,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("div", {
										className: "form-group",
										style: { margin: 0 },
										children: [/* @__PURE__ */ _jsxDEV("label", { children: "Religion" }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1668,
											columnNumber: 19
										}, this), /* @__PURE__ */ _jsxDEV("select", {
											className: "form-control",
											value: studentForm.religion,
											onChange: (e) => setStudentForm({
												...studentForm,
												religion: e.target.value
											}),
											children: [
												/* @__PURE__ */ _jsxDEV("option", { children: "Islam" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1670,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ _jsxDEV("option", { children: "Christianity" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1671,
													columnNumber: 21
												}, this),
												/* @__PURE__ */ _jsxDEV("option", { children: "Others" }, void 0, false, {
													fileName: _jsxFileName,
													lineNumber: 1672,
													columnNumber: 21
												}, this)
											]
										}, void 0, true, {
											fileName: _jsxFileName,
											lineNumber: 1669,
											columnNumber: 19
										}, this)]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1667,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1659,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "form-group",
									style: { margin: 0 },
									children: [/* @__PURE__ */ _jsxDEV("label", { children: "Home Address" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1677,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("input", {
										type: "text",
										className: "form-control",
										value: studentForm.address_residence,
										onChange: (e) => setStudentForm({
											...studentForm,
											address_residence: e.target.value
										})
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1678,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1676,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									className: "form-group",
									style: { margin: 0 },
									children: [/* @__PURE__ */ _jsxDEV("label", { children: "Last School Attended" }, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1681,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("input", {
										type: "text",
										className: "form-control",
										value: studentForm.last_school_attended,
										onChange: (e) => setStudentForm({
											...studentForm,
											last_school_attended: e.target.value
										})
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1682,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1680,
									columnNumber: 15
								}, this),
								/* @__PURE__ */ _jsxDEV("div", {
									style: {
										display: "flex",
										justifyContent: "flex-end",
										gap: "10px",
										marginTop: "8px"
									},
									children: [/* @__PURE__ */ _jsxDEV("button", {
										type: "button",
										className: "btn btn-secondary",
										onClick: () => setShowStudentModal(false),
										children: "Cancel"
									}, void 0, false, {
										fileName: _jsxFileName,
										lineNumber: 1685,
										columnNumber: 17
									}, this), /* @__PURE__ */ _jsxDEV("button", {
										type: "submit",
										className: "btn btn-primary",
										style: {
											display: "flex",
											alignItems: "center",
											gap: "6px"
										},
										children: [/* @__PURE__ */ _jsxDEV(Save, { size: 15 }, void 0, false, {
											fileName: _jsxFileName,
											lineNumber: 1686,
											columnNumber: 129
										}, this), " Register Student"]
									}, void 0, true, {
										fileName: _jsxFileName,
										lineNumber: 1686,
										columnNumber: 17
									}, this)]
								}, void 0, true, {
									fileName: _jsxFileName,
									lineNumber: 1684,
									columnNumber: 15
								}, this)
							]
						}, void 0, true, {
							fileName: _jsxFileName,
							lineNumber: 1620,
							columnNumber: 13
						}, this)
					]
				}, void 0, true, {
					fileName: _jsxFileName,
					lineNumber: 1612,
					columnNumber: 11
				}, this)
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 1611,
				columnNumber: 9
			}, this),
			viewingStudent && /* @__PURE__ */ _jsxDEV(StudentRegistrationForm, {
				student: viewingStudent,
				onClose: () => setViewingStudent(null),
				onUpdate: () => {
					setViewingStudent(null);
					loadFormClassStudents(assignments.formClass.id);
				}
			}, void 0, false, {
				fileName: _jsxFileName,
				lineNumber: 1697,
				columnNumber: 9
			}, this)
		]
	}, void 0, true, {
		fileName: _jsxFileName,
		lineNumber: 479,
		columnNumber: 5
	}, this);
}
_s(TeacherDashboard, "Xg3TBIf5wgSgeH+iZC9oLum9M9M=");
_c = TeacherDashboard;
var _c;
$RefreshReg$(_c, "TeacherDashboard");
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
import * as __vite_react_currentExports from "/src/pages/TeacherDashboard.jsx?t=1788183845351";
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }

  const currentExports = __vite_react_currentExports;
  queueMicrotask(() => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/N Concept World/Desktop/Nicholas'_Projects/Jere Model Academy/frontend/src/pages/TeacherDashboard.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/N Concept World/Desktop/Nicholas'_Projects/Jere Model Academy/frontend/src/pages/TeacherDashboard.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}
function $RefreshReg$(type, id) { return RefreshRuntime.register(type, "C:/Users/N Concept World/Desktop/Nicholas'_Projects/Jere Model Academy/frontend/src/pages/TeacherDashboard.jsx" + ' ' + id); }
function $RefreshSig$() { return RefreshRuntime.createSignatureFunctionForTransform(); }

//# sourceMappingURL=data:application/json;base64,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eEs7Ozs7OztRQUNMLHdCQUFDLE9BQUQ7U0FBSyxXQUFVO1NBQWEsT0FBTyxFQUFFLFFBQVEsRUFBRTttQkFBL0MsQ0FDRSx3QkFBQyxTQUFELFlBQU8sdUJBQTJCOzs7O21CQUNsQyx3QkFBQyxTQUFEO1VBQU8sTUFBSztVQUFPLFdBQVU7VUFBZSxPQUFPLFlBQVk7VUFBc0IsV0FBVyxNQUFNLGVBQWU7V0FBRSxHQUFHO1dBQWEsc0JBQXNCLEVBQUUsT0FBTztVQUFNLENBQUM7U0FBSTs7OztpQkFDOUs7Ozs7OztRQUNMLHdCQUFDLE9BQUQ7U0FBSyxPQUFPO1VBQUUsU0FBUztVQUFRLGdCQUFnQjtVQUFZLEtBQUs7VUFBUSxXQUFXO1NBQU07bUJBQXpGLENBQ0Usd0JBQUMsVUFBRDtVQUFRLE1BQUs7VUFBUyxXQUFVO1VBQW9CLGVBQWUsb0JBQW9CLEtBQUs7b0JBQUc7U0FBYzs7OzttQkFDN0csd0JBQUMsVUFBRDtVQUFRLE1BQUs7VUFBUyxXQUFVO1VBQWtCLE9BQU87V0FBRSxTQUFTO1dBQVEsWUFBWTtXQUFVLEtBQUs7VUFBTTtvQkFBN0csQ0FBZ0gsd0JBQUMsTUFBRCxFQUFNLE1BQU0sR0FBSzs7OztvQkFBQyxtQkFBeUI7Ozs7O2lCQUN4Sjs7Ozs7O09BQ0Q7Ozs7OztLQUNIOzs7Ozs7R0FDRjs7Ozs7R0FNTixrQkFDQyx3QkFBQyx5QkFBRDtJQUNFLFNBQVM7SUFDVCxlQUFlLGtCQUFrQixJQUFJO0lBQ3JDLGdCQUFnQjtLQUNkLGtCQUFrQixJQUFJO0tBQ3RCLHNCQUFzQixZQUFZLFVBQVUsRUFBRTtJQUNoRDtHQUNEOzs7OztFQUdBOzs7Ozs7QUFFVCIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJUZWFjaGVyRGFzaGJvYXJkLmpzeCJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IGFwaSBmcm9tICcuLi91dGlscy9hcGknO1xyXG5pbXBvcnQgQ2xhc3NCcm9hZHNoZWV0IGZyb20gJy4uL2NvbXBvbmVudHMvQ2xhc3NCcm9hZHNoZWV0JztcclxuaW1wb3J0IFRvYXN0IGZyb20gJy4uL2NvbXBvbmVudHMvVG9hc3QnO1xyXG5pbXBvcnQgU3R1ZGVudFJlZ2lzdHJhdGlvbkZvcm0gZnJvbSAnLi4vY29tcG9uZW50cy9TdHVkZW50UmVnaXN0cmF0aW9uRm9ybSc7XHJcbmltcG9ydCB7IEFycm93TGVmdCwgRWRpdDMsIENoZWNrU3F1YXJlLCBCYXJDaGFydDIsIEZpbGVTcHJlYWRzaGVldCwgRmlsZVRleHQsIFNhdmUsIFNlYXJjaCwgVXNlcnMsIEF3YXJkLCBDaGVja0NpcmNsZSwgWENpcmNsZSwgUGx1cywgTG9jaywgUHJpbnRlciwgQm9va09wZW4sIENsb2NrLCBVcGxvYWRDbG91ZCwgQ2hlY2tDaXJjbGUyLCBIb3VyZ2xhc3MsIEV5ZSB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XHJcbmltcG9ydCB7IFBpZUNoYXJ0LCBQaWUsIENlbGwsIFJlc3BvbnNpdmVDb250YWluZXIsIFRvb2x0aXAgfSBmcm9tICdyZWNoYXJ0cyc7XHJcbmltcG9ydCBodG1sMnBkZiBmcm9tICdodG1sMnBkZi5qcyc7XHJcbmltcG9ydCB7IERvd25sb2FkIH0gZnJvbSAnbHVjaWRlLXJlYWN0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFRlYWNoZXJEYXNoYm9hcmQoeyB1c2VyLCBzZXR0aW5ncywgYWN0aXZlVGFiLCBzdWJUYWIgfSkge1xyXG4gIGNvbnN0IFthY3RpdmVTdWJUYWIsIHNldEFjdGl2ZVN1YlRhYl0gPSB1c2VTdGF0ZSgnb3ZlcnZpZXcnKTtcclxuICBcclxuICBjb25zdCBhdHRlbmRhbmNlUmVwb3J0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpO1xyXG4gIGNvbnN0IHNjaGVtZVJlcG9ydFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKTtcclxuXHJcbiAgY29uc3QgaGFuZGxlRG93bmxvYWRBdHRlbmRhbmNlUERGID0gKCkgPT4ge1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGF0dGVuZGFuY2VSZXBvcnRSZWYuY3VycmVudDtcclxuICAgIGlmICghZWxlbWVudCkgcmV0dXJuO1xyXG4gICAgY29uc3Qgb3B0ID0ge1xyXG4gICAgICBtYXJnaW46IDAuMyxcclxuICAgICAgZmlsZW5hbWU6IGBBdHRlbmRhbmNlX1JlcG9ydC5wZGZgLFxyXG4gICAgICBpbWFnZTogeyB0eXBlOiAnanBlZycsIHF1YWxpdHk6IDAuOTggfSxcclxuICAgICAgaHRtbDJjYW52YXM6IHsgc2NhbGU6IDIgfSxcclxuICAgICAganNQREY6IHsgdW5pdDogJ2luJywgZm9ybWF0OiAnYTQnLCBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyB9XHJcbiAgICB9O1xyXG4gICAgaHRtbDJwZGYoKS5zZXQob3B0KS5mcm9tKGVsZW1lbnQpLnNhdmUoKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBoYW5kbGVEb3dubG9hZFNjaGVtZVBERiA9ICgpID0+IHtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBzY2hlbWVSZXBvcnRSZWYuY3VycmVudDtcclxuICAgIGlmICghZWxlbWVudCkgcmV0dXJuO1xyXG4gICAgY29uc3Qgb3B0ID0ge1xyXG4gICAgICBtYXJnaW46IDAuMyxcclxuICAgICAgZmlsZW5hbWU6IGBTY2hlbWVfT2ZfV29yay5wZGZgLFxyXG4gICAgICBpbWFnZTogeyB0eXBlOiAnanBlZycsIHF1YWxpdHk6IDAuOTggfSxcclxuICAgICAgaHRtbDJjYW52YXM6IHsgc2NhbGU6IDIgfSxcclxuICAgICAganNQREY6IHsgdW5pdDogJ2luJywgZm9ybWF0OiAnYTQnLCBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyB9XHJcbiAgICB9O1xyXG4gICAgaHRtbDJwZGYoKS5zZXQob3B0KS5mcm9tKGVsZW1lbnQpLnNhdmUoKTtcclxuICB9O1xyXG4gIFxyXG4gIC8vIFRlYWNoZXIgbWV0YWRhdGFcclxuICBjb25zdCBbYXNzaWdubWVudHMsIHNldEFzc2lnbm1lbnRzXSA9IHVzZVN0YXRlKHsgc3ViamVjdHM6IFtdLCBmb3JtQ2xhc3M6IG51bGwgfSk7XHJcbiAgY29uc3QgW3NlbGVjdGVkU3ViamVjdElkLCBzZXRTZWxlY3RlZFN1YmplY3RJZF0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW3Jlc3VsdFByb2dyZXNzLCBzZXRSZXN1bHRQcm9ncmVzc10gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbc2hvd1VwbG9hZERldGFpbHMsIHNldFNob3dVcGxvYWREZXRhaWxzXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBcclxuICAvLyBNYXJrcyBFbnRyeSBTdGF0ZXNcclxuICBjb25zdCBbc2VsZWN0ZWRDbGFzc1N1YmplY3QsIHNldFNlbGVjdGVkQ2xhc3NTdWJqZWN0XSA9IHVzZVN0YXRlKG51bGwpOyAvLyB7Y2xhc3NfaWQsIGNsYXNzX25hbWUsIHN1YmplY3RfaWQsIHN1YmplY3RfbmFtZX1cclxuICBjb25zdCBbc3R1ZGVudHNHcmFkZXMsIHNldFN0dWRlbnRzR3JhZGVzXSA9IHVzZVN0YXRlKFtdKTtcclxuICBcclxuICAvLyBBdHRlbmRhbmNlIFN0YXRlc1xyXG4gIGNvbnN0IFthdHRlbmRhbmNlRGF0ZSwgc2V0QXR0ZW5kYW5jZURhdGVdID0gdXNlU3RhdGUobmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF0pO1xyXG4gIGNvbnN0IFthdHRlbmRhbmNlUm9zdGVyLCBzZXRBdHRlbmRhbmNlUm9zdGVyXSA9IHVzZVN0YXRlKFtdKTtcclxuICBjb25zdCBbYXR0ZW5kYW5jZVJlcG9ydCwgc2V0QXR0ZW5kYW5jZVJlcG9ydF0gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2F0dGVuZGFuY2VSZXBvcnRTdGFydERhdGUsIHNldEF0dGVuZGFuY2VSZXBvcnRTdGFydERhdGVdID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFthdHRlbmRhbmNlUmVwb3J0RW5kRGF0ZSwgc2V0QXR0ZW5kYW5jZVJlcG9ydEVuZERhdGVdID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFthY3RpdmVBdHRlbmRhbmNlU3ViVGFiLCBzZXRBY3RpdmVBdHRlbmRhbmNlU3ViVGFiXSA9IHVzZVN0YXRlKCd0YWtlJyk7IC8vICd0YWtlJyBvciAncmVwb3J0J1xyXG5cclxuICAvLyBCcm9hZHNoZWV0IFN0YXRlc1xyXG4gIGNvbnN0IFticm9hZHNoZWV0RGF0YSwgc2V0QnJvYWRzaGVldERhdGFdID0gdXNlU3RhdGUobnVsbCk7XHJcblxyXG4gIC8vIEJlaGF2aW9yYWwgLyBQc3ljaG9tb3RvciBTdGF0ZXNcclxuICBjb25zdCBbc2tpbGxzTGlzdCwgc2V0U2tpbGxzTGlzdF0gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2JlaGF2aW9yYWxTdHVkZW50cywgc2V0QmVoYXZpb3JhbFN0dWRlbnRzXSA9IHVzZVN0YXRlKHsgcmF0ZWQ6IFtdLCB1bnJhdGVkOiBbXSB9KTtcclxuICBjb25zdCBbZXZhbHVhdGluZ1N0dWRlbnQsIHNldEV2YWx1YXRpbmdTdHVkZW50XSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtza2lsbFJhdGluZ3MsIHNldFNraWxsUmF0aW5nc10gPSB1c2VTdGF0ZSh7fSk7XHJcblxyXG4gIC8vIFNlYXJjaCAmIEZpbHRlciBTdGF0ZXNcclxuICBjb25zdCBbZ3JhZGVzU2VhcmNoLCBzZXRHcmFkZXNTZWFyY2hdID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFthdHRlbmRhbmNlU2VhcmNoLCBzZXRBdHRlbmRhbmNlU2VhcmNoXSA9IHVzZVN0YXRlKCcnKTtcclxuICBjb25zdCBbYmVoYXZpb3JhbFNlYXJjaCwgc2V0QmVoYXZpb3JhbFNlYXJjaF0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgY29uc3QgW3N0dWRlbnRTZWFyY2gsIHNldFN0dWRlbnRTZWFyY2hdID0gdXNlU3RhdGUoJycpO1xyXG5cclxuICAvLyBNeSBTdHVkZW50cyBTdGF0ZXNcclxuICBjb25zdCBbZm9ybUNsYXNzU3R1ZGVudHMsIHNldEZvcm1DbGFzc1N0dWRlbnRzXSA9IHVzZVN0YXRlKFtdKTtcclxuICBjb25zdCBbc3R1ZGVudHNMb2FkaW5nLCBzZXRTdHVkZW50c0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFtzaG93U3R1ZGVudE1vZGFsLCBzZXRTaG93U3R1ZGVudE1vZGFsXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbdmlld2luZ1N0dWRlbnQsIHNldFZpZXdpbmdTdHVkZW50XSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtzdHVkZW50Rm9ybSwgc2V0U3R1ZGVudEZvcm1dID0gdXNlU3RhdGUoe1xyXG4gICAgc3VybmFtZTogJycsIGZpcnN0X25hbWU6ICcnLCBvdGhlcl9uYW1lczogJycsIGZ1bGxfbmFtZTogJycsIGNsYXNzX2lkOiAnJyxcclxuICAgIGRhdGVfb2ZfYmlydGg6ICcnLCBzZXg6ICdNYWxlJywgcmVsaWdpb246ICdJc2xhbScsXHJcbiAgICBhZGRyZXNzX3Jlc2lkZW5jZTogJycsIGxhc3Rfc2Nob29sX2F0dGVuZGVkOiAnJywgcGFzc3BvcnRfcGhvdG86ICcnXHJcbiAgfSk7XHJcblxyXG4gIC8vIFN0YXR1cyBiYW5uZXJzXHJcbiAgY29uc3QgW25vdGlmeSwgc2V0Tm90aWZ5XSA9IHVzZVN0YXRlKCcnKTtcclxuICBjb25zdCBbZXJyb3JNc2csIHNldEVycm9yTXNnXSA9IHVzZVN0YXRlKCcnKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGxvYWRUZWFjaGVySW5mbygpO1xyXG4gICAgbG9hZFJlc3VsdFByb2dyZXNzKCk7XHJcbiAgfSwgW10pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGFjdGl2ZVRhYiAmJiBhY3RpdmVUYWIgIT09ICdkYXNoYm9hcmQnKSB7XHJcbiAgICAgIHNldEFjdGl2ZVN1YlRhYihhY3RpdmVUYWIpO1xyXG4gICAgICBpZiAoYWN0aXZlVGFiID09PSAnYXR0ZW5kYW5jZScgJiYgYXNzaWdubWVudHMuZm9ybUNsYXNzKSB7XHJcbiAgICAgICAgZmV0Y2hBdHRlbmRhbmNlKGFzc2lnbm1lbnRzLmZvcm1DbGFzcy5pZCwgYXR0ZW5kYW5jZURhdGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChhY3RpdmVUYWIgPT09ICdicm9hZHNoZWV0JyAmJiBhc3NpZ25tZW50cy5mb3JtQ2xhc3MpIHtcclxuICAgICAgICBmZXRjaEJyb2Fkc2hlZXQoYXNzaWdubWVudHMuZm9ybUNsYXNzLmlkKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoYWN0aXZlVGFiID09PSAnYmVoYXZpb3JhbCcgJiYgYXNzaWdubWVudHMuZm9ybUNsYXNzKSB7XHJcbiAgICAgICAgbG9hZEJlaGF2aW9yYWxSb3N0ZXIoKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoYWN0aXZlVGFiID09PSAnc2NoZW1lcycgJiYgYXNzaWdubWVudHMuc3ViamVjdHMubGVuZ3RoID4gMCAmJiB0ZWFjaGVyU2NoZW1lQXNzaWduSWR4ID09PSAnJykge1xyXG4gICAgICAgIHNldFRlYWNoZXJTY2hlbWVBc3NpZ25JZHgoMCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGFjdGl2ZVRhYiA9PT0gJ3N0dWRlbnRzJyAmJiBhc3NpZ25tZW50cy5mb3JtQ2xhc3MpIHtcclxuICAgICAgICBsb2FkRm9ybUNsYXNzU3R1ZGVudHMoYXNzaWdubWVudHMuZm9ybUNsYXNzLmlkKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChhY3RpdmVUYWIgPT09ICdkYXNoYm9hcmQnKSB7XHJcbiAgICAgIHNldEFjdGl2ZVN1YlRhYignb3ZlcnZpZXcnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc3ViVGFiICYmIGFjdGl2ZVRhYiA9PT0gJ2F0dGVuZGFuY2UnKSB7XHJcbiAgICAgIHNldEFjdGl2ZUF0dGVuZGFuY2VTdWJUYWIoc3ViVGFiKTtcclxuICAgIH1cclxuICB9LCBbYWN0aXZlVGFiLCBzdWJUYWIsIGFzc2lnbm1lbnRzLmZvcm1DbGFzcywgYXNzaWdubWVudHMuc3ViamVjdHNdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChhY3RpdmVTdWJUYWIgPT09ICdhdHRlbmRhbmNlJyAmJiBhY3RpdmVBdHRlbmRhbmNlU3ViVGFiID09PSAncmVwb3J0JyAmJiBhc3NpZ25tZW50cy5mb3JtQ2xhc3MpIHtcclxuICAgICAgZmV0Y2hBdHRlbmRhbmNlUmVwb3J0KCk7XHJcbiAgICB9XHJcbiAgfSwgW2FjdGl2ZVN1YlRhYiwgYWN0aXZlQXR0ZW5kYW5jZVN1YlRhYiwgYXR0ZW5kYW5jZVJlcG9ydFN0YXJ0RGF0ZSwgYXR0ZW5kYW5jZVJlcG9ydEVuZERhdGUsIGFzc2lnbm1lbnRzLmZvcm1DbGFzc10pO1xyXG5cclxuICBjb25zdCBsb2FkUmVzdWx0UHJvZ3Jlc3MgPSBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLmdldFRlYWNoZXJSZXN1bHRQcm9ncmVzcygpO1xyXG4gICAgICBzZXRSZXN1bHRQcm9ncmVzcyhkYXRhKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9hZCByZXN1bHQgcHJvZ3Jlc3M6JywgZXJyKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBsb2FkVGVhY2hlckluZm8gPSBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBpbmZvID0gYXdhaXQgYXBpLmdldFRlYWNoZXJBc3NpZ25tZW50cygpO1xyXG4gICAgICBzZXRBc3NpZ25tZW50cyhpbmZvKTtcclxuICAgICAgaWYgKGluZm8uZm9ybUNsYXNzKSB7XHJcbiAgICAgICAgLy8gQXV0b21hdGljYWxseSBmZXRjaCBicm9hZHNoZWV0IGFuZCBhdHRlbmRhbmNlIGZvciBmb3JtIGNsYXNzIGluaXRpYWxseVxyXG4gICAgICAgIGZldGNoQnJvYWRzaGVldChpbmZvLmZvcm1DbGFzcy5pZCk7XHJcbiAgICAgICAgZmV0Y2hBdHRlbmRhbmNlKGluZm8uZm9ybUNsYXNzLmlkLCBhdHRlbmRhbmNlRGF0ZSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvck1zZygnRmFpbGVkIHRvIHN5bmMgdGVhY2hlciBhc3NpZ25tZW50czogJyArIGVyci5tZXNzYWdlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBNWSBTVFVERU5UUyBMT0dJQ1xyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIGNvbnN0IGxvYWRGb3JtQ2xhc3NTdHVkZW50cyA9IGFzeW5jIChjbGFzc0lkKSA9PiB7XHJcbiAgICBpZiAoIWNsYXNzSWQpIHJldHVybjtcclxuICAgIHNldFN0dWRlbnRzTG9hZGluZyh0cnVlKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGFsbFN0dWRlbnRzID0gYXdhaXQgYXBpLmdldFN0dWRlbnRzKCk7XHJcbiAgICAgIGNvbnN0IGNsYXNzU3R1ZGVudHMgPSBhbGxTdHVkZW50cy5maWx0ZXIocyA9PiBzLmNsYXNzX2lkID09PSBjbGFzc0lkKTtcclxuICAgICAgc2V0Rm9ybUNsYXNzU3R1ZGVudHMoY2xhc3NTdHVkZW50cyk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgc2V0RXJyb3JNc2coJ0ZhaWxlZCB0byBsb2FkIGNsYXNzIHN0dWRlbnRzOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0U3R1ZGVudHNMb2FkaW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBoYW5kbGVSZWdpc3RlclN0dWRlbnQgPSBhc3luYyAoZSkgPT4ge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKCFhc3NpZ25tZW50cy5mb3JtQ2xhc3MpIHJldHVybjtcclxuICAgIHNldE5vdGlmeSgnJyk7XHJcbiAgICBzZXRFcnJvck1zZygnJyk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBwYXlsb2FkID0geyAuLi5zdHVkZW50Rm9ybSwgY2xhc3NfaWQ6IGFzc2lnbm1lbnRzLmZvcm1DbGFzcy5pZCB9O1xyXG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBhcGkucmVnaXN0ZXJTdHVkZW50KHBheWxvYWQpO1xyXG4gICAgICBzZXROb3RpZnkoYFN0dWRlbnQgcmVnaXN0ZXJlZCEgQWRtaXNzaW9uIE5vOiAke3Jlcy5hZG1pc3Npb25fbnVtYmVyfWApO1xyXG4gICAgICBzZXRTaG93U3R1ZGVudE1vZGFsKGZhbHNlKTtcclxuICAgICAgc2V0U3R1ZGVudEZvcm0oeyBzdXJuYW1lOiAnJywgZmlyc3RfbmFtZTogJycsIG90aGVyX25hbWVzOiAnJywgZnVsbF9uYW1lOiAnJywgY2xhc3NfaWQ6ICcnLCBkYXRlX29mX2JpcnRoOiAnJywgc2V4OiAnTWFsZScsIHJlbGlnaW9uOiAnSXNsYW0nLCBhZGRyZXNzX3Jlc2lkZW5jZTogJycsIGxhc3Rfc2Nob29sX2F0dGVuZGVkOiAnJywgcGFzc3BvcnRfcGhvdG86ICcnIH0pO1xyXG4gICAgICBsb2FkRm9ybUNsYXNzU3R1ZGVudHMoYXNzaWdubWVudHMuZm9ybUNsYXNzLmlkKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvck1zZygnRmFpbGVkIHRvIHJlZ2lzdGVyIHN0dWRlbnQ6ICcgKyBlcnIubWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgLy8gTUFSS1MgRU5UUlkgTE9HSUNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBjb25zdCBoYW5kbGVTZWxlY3RDbGFzc1N1YmplY3RGb3JHcmFkZXMgPSBhc3luYyAoYXNzaWduKSA9PiB7XHJcbiAgICBzZXRTZWxlY3RlZENsYXNzU3ViamVjdChhc3NpZ24pO1xyXG4gICAgc2V0Tm90aWZ5KCcnKTtcclxuICAgIHNldEVycm9yTXNnKCcnKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGdyYWRlcyA9IGF3YWl0IGFwaS5nZXRHcmFkZXNGb3JFbnRyeShhc3NpZ24uY2xhc3NfaWQsIGFzc2lnbi5zdWJqZWN0X2lkLCBzZXR0aW5ncy5hY3RpdmVfdGVybSwgc2V0dGluZ3MuYWN0aXZlX3Nlc3Npb24pO1xyXG4gICAgICBzZXRTdHVkZW50c0dyYWRlcyhncmFkZXMpO1xyXG4gICAgICBzZXRBY3RpdmVTdWJUYWIoJ2dyYWRlcycpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHNldEVycm9yTXNnKCdGYWlsZWQgdG8gbG9hZCBncmFkZSBib29rOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZUdyYWRlRmllbGRDaGFuZ2UgPSAoc3R1ZGVudElkLCBmaWVsZCwgdmFsdWUpID0+IHtcclxuICAgIGlmICh2YWx1ZSAhPT0gJycpIHtcclxuICAgICAgY29uc3QgbnVtVmFsID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcbiAgICAgIGlmIChbJ2NhMScsICdjYTInLCAnY2EzJywgJ2NhNCddLmluY2x1ZGVzKGZpZWxkKSAmJiBudW1WYWwgPiAxMCkge1xyXG4gICAgICAgIHNldEVycm9yTXNnKCdDQSBzY29yZSBjYW5ub3QgZXhjZWVkIDEwIG1hcmtzLicpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZmllbGQgPT09ICdleGFtX3Njb3JlJyAmJiBudW1WYWwgPiA2MCkge1xyXG4gICAgICAgIHNldEVycm9yTXNnKCdFeGFtIHNjb3JlIGNhbm5vdCBleGNlZWQgNjAgbWFya3MuJyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U3R1ZGVudHNHcmFkZXMocHJldiA9PiBwcmV2Lm1hcChnID0+IHtcclxuICAgICAgaWYgKGcuc3R1ZGVudF9pZCA9PT0gc3R1ZGVudElkKSB7XHJcbiAgICAgICAgY29uc3QgdXBkYXRlZCA9IHsgLi4uZywgW2ZpZWxkXTogdmFsdWUgfTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBBdXRvLWNhbGN1bGF0ZSB0b3RhbCBhbmQgZ3JhZGUgbGV0dGVyXHJcbiAgICAgICAgY29uc3QgYzEgPSBwYXJzZUZsb2F0KGZpZWxkID09PSAnY2ExJyA/IHZhbHVlIDogdXBkYXRlZC5jYTEgfHwgMCk7XHJcbiAgICAgICAgY29uc3QgYzIgPSBwYXJzZUZsb2F0KGZpZWxkID09PSAnY2EyJyA/IHZhbHVlIDogdXBkYXRlZC5jYTIgfHwgMCk7XHJcbiAgICAgICAgY29uc3QgYzMgPSBwYXJzZUZsb2F0KGZpZWxkID09PSAnY2EzJyA/IHZhbHVlIDogdXBkYXRlZC5jYTMgfHwgMCk7XHJcbiAgICAgICAgY29uc3QgYzQgPSBwYXJzZUZsb2F0KGZpZWxkID09PSAnY2E0JyA/IHZhbHVlIDogdXBkYXRlZC5jYTQgfHwgMCk7XHJcbiAgICAgICAgY29uc3QgZXhhbSA9IHBhcnNlRmxvYXQoZmllbGQgPT09ICdleGFtX3Njb3JlJyA/IHZhbHVlIDogdXBkYXRlZC5leGFtX3Njb3JlIHx8IDApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHRvdGFsID0gYzEgKyBjMiArIGMzICsgYzQgKyBleGFtO1xyXG4gICAgICAgIHVwZGF0ZWQudG90YWxfc2NvcmUgPSB0b3RhbDtcclxuICAgICAgICBcclxuICAgICAgICAvLyBHcmFkZSBMZXR0ZXIgbWFwcGluZ1xyXG4gICAgICAgIGlmICh0b3RhbCA+PSA3NSkgeyB1cGRhdGVkLmdyYWRlX2xldHRlciA9ICdBJzsgdXBkYXRlZC5yZW1hcmsgPSAnRXhjZWxsZW50JzsgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRvdGFsID49IDYwKSB7IHVwZGF0ZWQuZ3JhZGVfbGV0dGVyID0gJ0InOyB1cGRhdGVkLnJlbWFyayA9ICdWZXJ5IEdvb2QnOyB9XHJcbiAgICAgICAgZWxzZSBpZiAodG90YWwgPj0gNTApIHsgdXBkYXRlZC5ncmFkZV9sZXR0ZXIgPSAnQyc7IHVwZGF0ZWQucmVtYXJrID0gJ0dvb2QnOyB9XHJcbiAgICAgICAgZWxzZSBpZiAodG90YWwgPj0gNDApIHsgdXBkYXRlZC5ncmFkZV9sZXR0ZXIgPSAnRCc7IHVwZGF0ZWQucmVtYXJrID0gJ1Bhc3MnOyB9XHJcbiAgICAgICAgZWxzZSB7IHVwZGF0ZWQuZ3JhZGVfbGV0dGVyID0gJ0YnOyB1cGRhdGVkLnJlbWFyayA9ICdGYWlsJzsgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXBkYXRlZDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZztcclxuICAgIH0pKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBoYW5kbGVTYXZlR3JhZGVzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCFzZWxlY3RlZENsYXNzU3ViamVjdCkgcmV0dXJuO1xyXG4gICAgc2V0Tm90aWZ5KCcnKTtcclxuICAgIHNldEVycm9yTXNnKCcnKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGFwaS5zYXZlR3JhZGVzKHtcclxuICAgICAgICBjbGFzc19pZDogc2VsZWN0ZWRDbGFzc1N1YmplY3QuY2xhc3NfaWQsXHJcbiAgICAgICAgc3ViamVjdF9pZDogc2VsZWN0ZWRDbGFzc1N1YmplY3Quc3ViamVjdF9pZCxcclxuICAgICAgICB0ZXJtOiBzZXR0aW5ncy5hY3RpdmVfdGVybSxcclxuICAgICAgICBhY2FkZW1pY195ZWFyOiBzZXR0aW5ncy5hY3RpdmVfc2Vzc2lvbixcclxuICAgICAgICBncmFkZXM6IHN0dWRlbnRzR3JhZGVzXHJcbiAgICAgIH0pO1xyXG4gICAgICBzZXROb3RpZnkoJ0dyYWRlcyBzdWJtaXR0ZWQgYW5kIHNhdmVkIHN1Y2Nlc3NmdWxseSEnKTtcclxuICAgICAgLy8gUmVsb2FkIGJyb2Fkc2hlZXQgdG8ga2VlcCBzeW5jaHJvbml6ZWRcclxuICAgICAgaWYgKGFzc2lnbm1lbnRzLmZvcm1DbGFzcykgZmV0Y2hCcm9hZHNoZWV0KGFzc2lnbm1lbnRzLmZvcm1DbGFzcy5pZCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgc2V0RXJyb3JNc2coZXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEFUVEVOREFOQ0UgTE9HSUNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBjb25zdCBmZXRjaEF0dGVuZGFuY2UgPSBhc3luYyAoY2xhc3NJZCwgZGF0ZSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgcm9zdGVyID0gYXdhaXQgYXBpLmdldEF0dGVuZGFuY2UoY2xhc3NJZCwgZGF0ZSk7XHJcbiAgICAgIHNldEF0dGVuZGFuY2VSb3N0ZXIocm9zdGVyKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvck1zZygnRmFpbGVkIHRvIGZldGNoIGF0dGVuZGFuY2Ugcm9zdGVyOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZUF0dGVuZGFuY2VDaGFuZ2UgPSAoc3R1ZGVudElkLCBzdGF0dXMpID0+IHtcclxuICAgIHNldEF0dGVuZGFuY2VSb3N0ZXIocHJldiA9PiBwcmV2Lm1hcChyID0+IHIuc3R1ZGVudF9pZCA9PT0gc3R1ZGVudElkID8geyAuLi5yLCBzdGF0dXMgfSA6IHIpKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBoYW5kbGVTYXZlQXR0ZW5kYW5jZSA9IGFzeW5jICgpID0+IHtcclxuICAgIGlmICghYXNzaWdubWVudHMuZm9ybUNsYXNzKSByZXR1cm47XHJcbiAgICBzZXROb3RpZnkoJycpO1xyXG4gICAgc2V0RXJyb3JNc2coJycpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVjb3JkcyA9IGF0dGVuZGFuY2VSb3N0ZXIubWFwKHIgPT4gKHtcclxuICAgICAgICBzdHVkZW50X2lkOiByLnN0dWRlbnRfaWQsXHJcbiAgICAgICAgc3RhdHVzOiByLnN0YXR1cyB8fCAncHJlc2VudCdcclxuICAgICAgfSkpO1xyXG4gICAgICBhd2FpdCBhcGkuc2F2ZUF0dGVuZGFuY2Uoe1xyXG4gICAgICAgIGNsYXNzX2lkOiBhc3NpZ25tZW50cy5mb3JtQ2xhc3MuaWQsXHJcbiAgICAgICAgZGF0ZTogYXR0ZW5kYW5jZURhdGUsXHJcbiAgICAgICAgcmVjb3Jkc1xyXG4gICAgICB9KTtcclxuICAgICAgc2V0Tm90aWZ5KGBBdHRlbmRhbmNlIHN1Y2Nlc3NmdWxseSByZWdpc3RlcmVkIGZvciAke2F0dGVuZGFuY2VEYXRlfSFgKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvck1zZyhlcnIubWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZmV0Y2hBdHRlbmRhbmNlUmVwb3J0ID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCFhc3NpZ25tZW50cy5mb3JtQ2xhc3MpIHJldHVybjtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBhcGkuZ2V0QXR0ZW5kYW5jZVJlcG9ydChhc3NpZ25tZW50cy5mb3JtQ2xhc3MuaWQsIGF0dGVuZGFuY2VSZXBvcnRTdGFydERhdGUsIGF0dGVuZGFuY2VSZXBvcnRFbmREYXRlKTtcclxuICAgICAgc2V0QXR0ZW5kYW5jZVJlcG9ydChkYXRhKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvck1zZygnRmFpbGVkIHRvIGZldGNoIGF0dGVuZGFuY2UgcmVwb3J0OiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gIC8vIEJST0FEU0hFRVQgTE9HSUNcclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICBjb25zdCBmZXRjaEJyb2Fkc2hlZXQgPSBhc3luYyAoY2xhc3NJZCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgc2hlZXQgPSBhd2FpdCBhcGkuZ2V0QnJvYWRzaGVldChjbGFzc0lkLCBzZXR0aW5ncy5hY3RpdmVfdGVybSwgc2V0dGluZ3MuYWN0aXZlX3Nlc3Npb24pO1xyXG4gICAgICBzZXRCcm9hZHNoZWV0RGF0YShzaGVldCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgc2V0RXJyb3JNc2coJ0ZhaWxlZCB0byBzeW5jIGJyb2Fkc2hlZXQ6ICcgKyBlcnIubWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbG9hZEJlaGF2aW9yYWxSb3N0ZXIgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoIWFzc2lnbm1lbnRzLmZvcm1DbGFzcykgcmV0dXJuO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIC8vIDEuIEZldGNoIFNraWxsc1xyXG4gICAgICAgIGNvbnN0IGZldGNoZWRTa2lsbHMgPSBhd2FpdCBhcGkuZ2V0U2tpbGxzKGFzc2lnbm1lbnRzLmZvcm1DbGFzcy50aWVyKTtcclxuICAgICAgICBzZXRTa2lsbHNMaXN0KGZldGNoZWRTa2lsbHMpO1xyXG5cclxuICAgICAgLy8gMi4gRmV0Y2ggUmF0ZWQvVW5yYXRlZCBTdHVkZW50c1xyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgYXBpLmdldFNraWxsc1N0dWRlbnRzKGFzc2lnbm1lbnRzLmZvcm1DbGFzcy5pZCwgc2V0dGluZ3MuYWN0aXZlX3Rlcm0sIHNldHRpbmdzLmFjdGl2ZV9zZXNzaW9uKTtcclxuICAgICAgc2V0QmVoYXZpb3JhbFN0dWRlbnRzKGRhdGEpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHNldEVycm9yTXNnKCdGYWlsZWQgdG8gbG9hZCBwc3ljaG9tb3RvciBkYXRhOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZVNlbGVjdFN0dWRlbnRGb3JFdmFsID0gYXN5bmMgKHN0dWRlbnQpID0+IHtcclxuICAgIHNldEV2YWx1YXRpbmdTdHVkZW50KHN0dWRlbnQpO1xyXG4gICAgc2V0Tm90aWZ5KCcnKTtcclxuICAgIHNldEVycm9yTXNnKCcnKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgYXBpLmdldFN0dWRlbnRTa2lsbHNFdmFsdWF0aW9uKHN0dWRlbnQuaWQsIHNldHRpbmdzLmFjdGl2ZV90ZXJtLCBzZXR0aW5ncy5hY3RpdmVfc2Vzc2lvbik7XHJcbiAgICAgIGNvbnN0IHJhdGluZ3NNYXAgPSB7fTtcclxuICAgICAgZXhpc3RpbmcuZm9yRWFjaChyID0+IHsgcmF0aW5nc01hcFtgJHtyLnNraWxsX2lkfV8ke3IuY2F0ZWdvcnl9YF0gPSByLnJhdGluZzsgfSk7XHJcbiAgICAgIHNldFNraWxsUmF0aW5ncyhyYXRpbmdzTWFwKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvck1zZygnRmFpbGVkIHRvIGZldGNoIGV4aXN0aW5nIHJhdGluZ3M6ICcgKyBlcnIubWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaGFuZGxlU2F2ZVNraWxsRXZhbHVhdGlvbiA9IGFzeW5jIChlKSA9PiB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAoIWV2YWx1YXRpbmdTdHVkZW50KSByZXR1cm47XHJcbiAgICBzZXROb3RpZnkoJycpO1xyXG4gICAgc2V0RXJyb3JNc2coJycpO1xyXG4gICAgXHJcbiAgICAvLyBWYWxpZGF0ZSBhbGwgc2tpbGxzIGhhdmUgYSByYXRpbmdcclxuICAgIGZvciAobGV0IHNraWxsIG9mIHNraWxsc0xpc3QpIHtcclxuICAgICAgaWYgKCFza2lsbFJhdGluZ3NbYCR7c2tpbGwuaWR9XyR7c2tpbGwuY2F0ZWdvcnl9YF0pIHtcclxuICAgICAgICBzZXRFcnJvck1zZyhgUGxlYXNlIHNlbGVjdCBhIHJhdGluZyBmb3IgJHtza2lsbC5uYW1lfWApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICAgICAgc3R1ZGVudF9pZDogZXZhbHVhdGluZ1N0dWRlbnQuaWQsXHJcbiAgICAgICAgdGVybTogc2V0dGluZ3MuYWN0aXZlX3Rlcm0sXHJcbiAgICAgICAgc2Vzc2lvbjogc2V0dGluZ3MuYWN0aXZlX3Nlc3Npb24sXHJcbiAgICAgICAgcmF0aW5nczogc2tpbGxzTGlzdC5tYXAoc2tpbGwgPT4gKHtcclxuICAgICAgICAgIHNraWxsX2lkOiBza2lsbC5pZCxcclxuICAgICAgICAgIGNhdGVnb3J5OiBza2lsbC5jYXRlZ29yeSxcclxuICAgICAgICAgIHJhdGluZzogc2tpbGxSYXRpbmdzW2Ake3NraWxsLmlkfV8ke3NraWxsLmNhdGVnb3J5fWBdXHJcbiAgICAgICAgfSkpXHJcbiAgICAgIH07XHJcbiAgICAgIGF3YWl0IGFwaS5zYXZlU3R1ZGVudFNraWxsc0V2YWx1YXRpb24ocGF5bG9hZCk7XHJcbiAgICAgIHNldE5vdGlmeSgnU2tpbGxzIGV2YWx1YXRpb24gc2F2ZWQgc3VjY2Vzc2Z1bGx5IScpO1xyXG4gICAgICBzZXRFdmFsdWF0aW5nU3R1ZGVudChudWxsKTtcclxuICAgICAgbG9hZEJlaGF2aW9yYWxSb3N0ZXIoKTsgLy8gUmVsb2FkIHJvc3RlciB0byBtb3ZlIHN0dWRlbnQgdG8gJ3JhdGVkJ1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIHNldEVycm9yTXNnKGVyci5tZXNzYWdlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAvLyBURUFDSEVSIFNDSEVNRSBPRiBXT1JLIExPR0lDXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgY29uc3QgW3RlYWNoZXJTY2hlbWVBc3NpZ25JZHgsIHNldFRlYWNoZXJTY2hlbWVBc3NpZ25JZHhdID0gdXNlU3RhdGUoJycpO1xyXG4gIGNvbnN0IFt0ZWFjaGVyU2NoZW1lVGVybSwgc2V0VGVhY2hlclNjaGVtZVRlcm1dID0gdXNlU3RhdGUoJzNyZCBUZXJtJyk7XHJcbiAgY29uc3QgW3RlYWNoZXJTY2hlbWVXZWVrcywgc2V0VGVhY2hlclNjaGVtZVdlZWtzXSA9IHVzZVN0YXRlKEFycmF5LmZyb20oeyBsZW5ndGg6IDEyIH0sIChfLCBpKSA9PiAoeyB3ZWVrOiBpICsgMSwgdG9waWM6ICcnLCBvYmplY3RpdmVzOiAnJywgaWQ6IG51bGwgfSkpKTtcclxuXHJcbiAgY29uc3QgbG9hZFRlYWNoZXJTY2hlbWVzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKHRlYWNoZXJTY2hlbWVBc3NpZ25JZHggPT09ICcnKSByZXR1cm47XHJcbiAgICBjb25zdCBhc3NpZ24gPSBhc3NpZ25tZW50cy5zdWJqZWN0c1t0ZWFjaGVyU2NoZW1lQXNzaWduSWR4XTtcclxuICAgIGlmICghYXNzaWduKSByZXR1cm47XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGFwaS5nZXRTY2hlbWVzKHtcclxuICAgICAgICBjbGFzc19pZDogYXNzaWduLmNsYXNzX2lkLFxyXG4gICAgICAgIHN1YmplY3RfaWQ6IGFzc2lnbi5zdWJqZWN0X2lkLFxyXG4gICAgICAgIHRlcm06IHRlYWNoZXJTY2hlbWVUZXJtXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgbmV3V2Vla3MgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxMiB9LCAoXywgaSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHdrTnVtID0gaSArIDE7XHJcbiAgICAgICAgY29uc3QgZW50cnkgPSBkYXRhLmZpbmQoaXRlbSA9PiBpdGVtLndlZWsgPT09IHdrTnVtKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgd2Vlazogd2tOdW0sXHJcbiAgICAgICAgICB0b3BpYzogZW50cnkgPyBlbnRyeS50b3BpYyA6ICcnLFxyXG4gICAgICAgICAgb2JqZWN0aXZlczogZW50cnkgPyBlbnRyeS5vYmplY3RpdmVzIHx8ICcnIDogJycsXHJcbiAgICAgICAgICBpZDogZW50cnkgPyBlbnRyeS5pZCA6IG51bGxcclxuICAgICAgICB9O1xyXG4gICAgICB9KTtcclxuICAgICAgc2V0VGVhY2hlclNjaGVtZVdlZWtzKG5ld1dlZWtzKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBzZXRFcnJvck1zZygnRmFpbGVkIHRvIGxvYWQgc2NoZW1lcyBvZiB3b3JrOiAnICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZVRlYWNoZXJTY2hlbWVGaWVsZENoYW5nZSA9ICh3ZWVrTnVtLCBmaWVsZCwgdmFsdWUpID0+IHtcclxuICAgIHNldFRlYWNoZXJTY2hlbWVXZWVrcyhwcmV2ID0+IHByZXYubWFwKHcgPT4ge1xyXG4gICAgICBpZiAody53ZWVrID09PSB3ZWVrTnVtKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgLi4udywgW2ZpZWxkXTogdmFsdWUgfTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdztcclxuICAgIH0pKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBoYW5kbGVTYXZlVGVhY2hlclNjaGVtZVdlZWsgPSBhc3luYyAod2Vla09iaikgPT4ge1xyXG4gICAgc2V0Tm90aWZ5KCcnKTtcclxuICAgIHNldEVycm9yTXNnKCcnKTtcclxuICAgIGlmICh0ZWFjaGVyU2NoZW1lQXNzaWduSWR4ID09PSAnJykgcmV0dXJuO1xyXG4gICAgY29uc3QgYXNzaWduID0gYXNzaWdubWVudHMuc3ViamVjdHNbdGVhY2hlclNjaGVtZUFzc2lnbklkeF07XHJcbiAgICBpZiAoIWFzc2lnbikgcmV0dXJuO1xyXG5cclxuICAgIGlmICghd2Vla09iai50b3BpYykge1xyXG4gICAgICBzZXRFcnJvck1zZyhgVG9waWMgZm9yIFdlZWsgJHt3ZWVrT2JqLndlZWt9IGlzIHJlcXVpcmVkIHRvIHNhdmUuYCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBhcGkuc2F2ZVNjaGVtZSh7XHJcbiAgICAgICAgY2xhc3NfaWQ6IGFzc2lnbi5jbGFzc19pZCxcclxuICAgICAgICBzdWJqZWN0X2lkOiBhc3NpZ24uc3ViamVjdF9pZCxcclxuICAgICAgICB0ZXJtOiB0ZWFjaGVyU2NoZW1lVGVybSxcclxuICAgICAgICB3ZWVrOiB3ZWVrT2JqLndlZWssXHJcbiAgICAgICAgdG9waWM6IHdlZWtPYmoudG9waWMsXHJcbiAgICAgICAgb2JqZWN0aXZlczogd2Vla09iai5vYmplY3RpdmVzXHJcbiAgICAgIH0pO1xyXG4gICAgICBzZXROb3RpZnkoYFN1Y2Nlc3NmdWxseSBzYXZlZCBXZWVrICR7d2Vla09iai53ZWVrfSBTY2hlbWUgb2YgV29yayFgKTtcclxuICAgICAgbG9hZFRlYWNoZXJTY2hlbWVzKCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgc2V0RXJyb3JNc2coYEZhaWxlZCB0byBzYXZlIFdlZWsgJHt3ZWVrT2JqLndlZWt9OiBgICsgZXJyLm1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZURlbGV0ZVRlYWNoZXJTY2hlbWVXZWVrID0gYXN5bmMgKHdlZWtPYmopID0+IHtcclxuICAgIGlmICghd2Vla09iai5pZCkge1xyXG4gICAgICBoYW5kbGVUZWFjaGVyU2NoZW1lRmllbGRDaGFuZ2Uod2Vla09iai53ZWVrLCAndG9waWMnLCAnJyk7XHJcbiAgICAgIGhhbmRsZVRlYWNoZXJTY2hlbWVGaWVsZENoYW5nZSh3ZWVrT2JqLndlZWssICdvYmplY3RpdmVzJywgJycpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzZXROb3RpZnkoJycpO1xyXG4gICAgc2V0RXJyb3JNc2coJycpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgYXBpLmRlbGV0ZVNjaGVtZSh3ZWVrT2JqLmlkKTtcclxuICAgICAgc2V0Tm90aWZ5KGBTdWNjZXNzZnVsbHkgZGVsZXRlZCBXZWVrICR7d2Vla09iai53ZWVrfSBlbnRyeS5gKTtcclxuICAgICAgbG9hZFRlYWNoZXJTY2hlbWVzKCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgc2V0RXJyb3JNc2coYEZhaWxlZCB0byBkZWxldGUgV2VlayAke3dlZWtPYmoud2Vla306IGAgKyBlcnIubWVzc2FnZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChhY3RpdmVTdWJUYWIgPT09ICdzY2hlbWVzJyAmJiB0ZWFjaGVyU2NoZW1lQXNzaWduSWR4ICE9PSAnJykge1xyXG4gICAgICBsb2FkVGVhY2hlclNjaGVtZXMoKTtcclxuICAgIH1cclxuICB9LCBbYWN0aXZlU3ViVGFiLCB0ZWFjaGVyU2NoZW1lQXNzaWduSWR4LCB0ZWFjaGVyU2NoZW1lVGVybV0pO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICcxZnInLCBnYXA6ICcyNHB4JyB9fT5cclxuICAgICAgXHJcbiAgICAgIHsvKiBUb2FzdCBOb3RpZmljYXRpb25zICovfVxyXG4gICAgICA8VG9hc3QgbWVzc2FnZT17bm90aWZ5fSB0eXBlPVwic3VjY2Vzc1wiIG9uQ2xvc2U9eygpID0+IHNldE5vdGlmeSgnJyl9IGR1cmF0aW9uPXs0MDAwfSAvPlxyXG4gICAgICA8VG9hc3QgbWVzc2FnZT17ZXJyb3JNc2d9IHR5cGU9XCJlcnJvclwiIG9uQ2xvc2U9eygpID0+IHNldEVycm9yTXNnKCcnKX0gZHVyYXRpb249ezUwMDB9IC8+XHJcblxyXG5cclxuXHJcbiAgICAgIHsvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgICAgIFRBQiAxOiBBU1NJR05FRCBTVUJKRUNUUyBJTkRFWFxyXG4gICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7YWN0aXZlU3ViVGFiID09PSAnb3ZlcnZpZXcnICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmciAxZnInLCBnYXA6ICcyNHB4JyB9fT5cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgey8qIFJFU1VMVCBVUExPQUQgUFJPR1JFU1MgV0lER0VUICovfVxyXG4gICAgICAgICAgey8qIFJFU1VMVCBVUExPQUQgUFJPR1JFU1MgV0lER0VUICovfVxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1wYW5lbFwiIHN0eWxlPXt7IGdyaWRDb2x1bW46ICcxIC8gLTEnLCBwYWRkaW5nOiAnMjhweCcsIGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXN1cmZhY2UpJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMjRweCcgfX0+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZmxleFdyYXA6ICd3cmFwJywgZ2FwOiAnMTJweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46IDAsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzEwcHgnLCBmb250U2l6ZTogJzEuNHJlbScgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxCYXJDaGFydDIgc2l6ZT17MjR9IHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tcHJpbWFyeSknIH19IC8+IFJlc3VsdCBVcGxvYWQgUHJvZ3Jlc3NcclxuICAgICAgICAgICAgICAgIDwvaDM+XHJcbiAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBjb2xvcjogJ3ZhcigtLXRleHQtc2Vjb25kYXJ5KScsIGZvbnRTaXplOiAnMC45cmVtJywgbWFyZ2luOiAnNnB4IDAgMCAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgTWFya3Mgc3VibWlzc2lvbiBvdmVydmlldyBmb3IgPHN0cm9uZz57cmVzdWx0UHJvZ3Jlc3M/LnRlcm0gfHwgJ0N1cnJlbnQgVGVybSd9ICh7cmVzdWx0UHJvZ3Jlc3M/LmFjYWRlbWljX3llYXIgfHwgJ1Nlc3Npb24nfSk8L3N0cm9uZz5cclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIFxyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1vdXRsaW5lXCJcclxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dVcGxvYWREZXRhaWxzKCFzaG93VXBsb2FkRGV0YWlscyl9XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnIH19XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAge3Nob3dVcGxvYWREZXRhaWxzID8gJ0NvbGxhcHNlIERldGFpbHMnIDogJ1ZpZXcgRGV0YWlscyd9XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdtaW5tYXgoMjAwcHgsIDFmcikgMmZyJywgZ2FwOiAnMzBweCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICAgIHsvKiBEb251dCBDaGFydCAqL31cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogJzIyMHB4JywgcG9zaXRpb246ICdyZWxhdGl2ZScgfX0+XHJcbiAgICAgICAgICAgICAgICA8UmVzcG9uc2l2ZUNvbnRhaW5lciB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxQaWVDaGFydD5cclxuICAgICAgICAgICAgICAgICAgICA8UGllXHJcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhPXtbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0NvbXBsZXRlZCcsIHZhbHVlOiByZXN1bHRQcm9ncmVzcz8uc3VtbWFyeT8uY29tcGxldGVkIHx8IDAsIGNvbG9yOiAnIzEwYjk4MScgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnSW4gUHJvZ3Jlc3MnLCB2YWx1ZTogcmVzdWx0UHJvZ3Jlc3M/LnN1bW1hcnk/LmluX3Byb2dyZXNzIHx8IDAsIGNvbG9yOiAnI2Y1OWUwYicgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnUGVuZGluZycsIHZhbHVlOiByZXN1bHRQcm9ncmVzcz8uc3VtbWFyeT8ucGVuZGluZyB8fCAwLCBjb2xvcjogJyNlZjQ0NDQnIH1cclxuICAgICAgICAgICAgICAgICAgICAgIF0uZmlsdGVyKGQgPT4gZC52YWx1ZSA+IDApfVxyXG4gICAgICAgICAgICAgICAgICAgICAgY3g9XCI1MCVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgY3k9XCI1MCVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgaW5uZXJSYWRpdXM9ezY1fVxyXG4gICAgICAgICAgICAgICAgICAgICAgb3V0ZXJSYWRpdXM9ezkwfVxyXG4gICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0FuZ2xlPXs1fVxyXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YUtleT1cInZhbHVlXCJcclxuICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZT1cIm5vbmVcIlxyXG4gICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgIHtbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogJ0NvbXBsZXRlZCcsIHZhbHVlOiByZXN1bHRQcm9ncmVzcz8uc3VtbWFyeT8uY29tcGxldGVkIHx8IDAsIGNvbG9yOiAnIzEwYjk4MScgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnSW4gUHJvZ3Jlc3MnLCB2YWx1ZTogcmVzdWx0UHJvZ3Jlc3M/LnN1bW1hcnk/LmluX3Byb2dyZXNzIHx8IDAsIGNvbG9yOiAnI2Y1OWUwYicgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiAnUGVuZGluZycsIHZhbHVlOiByZXN1bHRQcm9ncmVzcz8uc3VtbWFyeT8ucGVuZGluZyB8fCAwLCBjb2xvcjogJyNlZjQ0NDQnIH1cclxuICAgICAgICAgICAgICAgICAgICAgIF0uZmlsdGVyKGQgPT4gZC52YWx1ZSA+IDApLm1hcCgoZW50cnksIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxDZWxsIGtleT17YGNlbGwtJHtpbmRleH1gfSBmaWxsPXtlbnRyeS5jb2xvcn0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvUGllPlxyXG4gICAgICAgICAgICAgICAgICAgIDxUb29sdGlwIFxyXG4gICAgICAgICAgICAgICAgICAgICAgY29udGVudFN0eWxlPXt7IGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJ25vbmUnLCBib3hTaGFkb3c6ICcwIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4xKScgfX1cclxuICAgICAgICAgICAgICAgICAgICAgIGl0ZW1TdHlsZT17eyBmb250V2VpZ2h0OiAnYm9sZCcgfX1cclxuICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICA8L1BpZUNoYXJ0PlxyXG4gICAgICAgICAgICAgICAgPC9SZXNwb25zaXZlQ29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgey8qIENlbnRlciBQZXJjZW50YWdlICovfVxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogJzUwJScsIGxlZnQ6ICc1MCUnLCB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoLTUwJSwgLTUwJSknLCBcclxuICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJywgcG9pbnRlckV2ZW50czogJ25vbmUnIFxyXG4gICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcycmVtJywgZm9udFdlaWdodDogJzgwMCcsIGNvbG9yOiByZXN1bHRQcm9ncmVzcz8uc3VtbWFyeT8ucGVyY2VudGFnZSA9PT0gMTAwID8gJyMxMGI5ODEnIDogJ3ZhcigtLXRleHQtcHJpbWFyeSknLCBsaW5lSGVpZ2h0OiAnMScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAge3Jlc3VsdFByb2dyZXNzPy5zdW1tYXJ5Py5wZXJjZW50YWdlIHx8IDB9JVxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzAuNzVyZW0nLCBjb2xvcjogJ3ZhcigtLXRleHQtbXV0ZWQpJywgZm9udFdlaWdodDogJzYwMCcsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PkRvbmU8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICB7LyogU3VtbWFyeSBDb3VudGVycyAqL31cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJ3JlcGVhdCgyLCAxZnIpJywgZ2FwOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4JywgYm9yZGVyUmFkaXVzOiAnMTJweCcsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoNTksIDEzMCwgMjQ2LCAwLjA1KScsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xNSknLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6ICc4cHgnLCB0cmFuc2l0aW9uOiAndHJhbnNmb3JtIDAuMnMnLCBjdXJzb3I6ICdkZWZhdWx0JyB9fSBvbk1vdXNlRW50ZXI9eyhlKSA9PiBlLmN1cnJlbnRUYXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoLTJweCknfSBvbk1vdXNlTGVhdmU9eyhlKSA9PiBlLmN1cnJlbnRUYXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ25vbmUnfT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnLCBjb2xvcjogJyMzYjgyZjYnLCBmb250U2l6ZTogJzAuODVyZW0nLCBmb250V2VpZ2h0OiAnNjAwJyB9fT48Qm9va09wZW4gc2l6ZT17MTZ9IC8+IFRvdGFsIFN1YmplY3RzPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxLjhyZW0nLCBmb250V2VpZ2h0OiAnODAwJywgY29sb3I6ICcjMWU0MGFmJyB9fT57cmVzdWx0UHJvZ3Jlc3M/LnN1bW1hcnk/LnRvdGFsIHx8IDB9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzE2cHgnLCBib3JkZXJSYWRpdXM6ICcxMnB4JywgYmFja2dyb3VuZENvbG9yOiAncmdiYSgxNiwgMTg1LCAxMjksIDAuMDUpJywgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMTYsIDE4NSwgMTI5LCAwLjE1KScsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzhweCcsIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gMC4ycycsIGN1cnNvcjogJ2RlZmF1bHQnIH19IG9uTW91c2VFbnRlcj17KGUpID0+IGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgtMnB4KSd9IG9uTW91c2VMZWF2ZT17KGUpID0+IGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAnbm9uZSd9PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcsIGNvbG9yOiAnIzEwYjk4MScsIGZvbnRTaXplOiAnMC44NXJlbScsIGZvbnRXZWlnaHQ6ICc2MDAnIH19PjxDaGVja0NpcmNsZTIgc2l6ZT17MTZ9IC8+IEZ1bGx5IFVwbG9hZGVkPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxLjhyZW0nLCBmb250V2VpZ2h0OiAnODAwJywgY29sb3I6ICcjMDY1ZjQ2JyB9fT57cmVzdWx0UHJvZ3Jlc3M/LnN1bW1hcnk/LmNvbXBsZXRlZCB8fCAwfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4JywgYm9yZGVyUmFkaXVzOiAnMTJweCcsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjQ1LCAxNTgsIDExLCAwLjA1KScsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDI0NSwgMTU4LCAxMSwgMC4xNSknLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6ICc4cHgnLCB0cmFuc2l0aW9uOiAndHJhbnNmb3JtIDAuMnMnLCBjdXJzb3I6ICdkZWZhdWx0JyB9fSBvbk1vdXNlRW50ZXI9eyhlKSA9PiBlLmN1cnJlbnRUYXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoLTJweCknfSBvbk1vdXNlTGVhdmU9eyhlKSA9PiBlLmN1cnJlbnRUYXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ25vbmUnfT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnLCBjb2xvcjogJyNmNTllMGInLCBmb250U2l6ZTogJzAuODVyZW0nLCBmb250V2VpZ2h0OiAnNjAwJyB9fT48SG91cmdsYXNzIHNpemU9ezE2fSAvPiBJbiBQcm9ncmVzczwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMS44cmVtJywgZm9udFdlaWdodDogJzgwMCcsIGNvbG9yOiAnIzkyNDAwZScgfX0+e3Jlc3VsdFByb2dyZXNzPy5zdW1tYXJ5Py5pbl9wcm9ncmVzcyB8fCAwfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4JywgYm9yZGVyUmFkaXVzOiAnMTJweCcsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjM5LCA2OCwgNjgsIDAuMDUpJywgYm9yZGVyOiAnMXB4IHNvbGlkIHJnYmEoMjM5LCA2OCwgNjgsIDAuMTUpJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnOHB4JywgdHJhbnNpdGlvbjogJ3RyYW5zZm9ybSAwLjJzJywgY3Vyc29yOiAnZGVmYXVsdCcgfX0gb25Nb3VzZUVudGVyPXsoZSkgPT4gZS5jdXJyZW50VGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVZKC0ycHgpJ30gb25Nb3VzZUxlYXZlPXsoZSkgPT4gZS5jdXJyZW50VGFyZ2V0LnN0eWxlLnRyYW5zZm9ybSA9ICdub25lJ30+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNnB4JywgY29sb3I6ICcjZWY0NDQ0JywgZm9udFNpemU6ICcwLjg1cmVtJywgZm9udFdlaWdodDogJzYwMCcgfX0+PENsb2NrIHNpemU9ezE2fSAvPiBQZW5kaW5nIFVwbG9hZHM8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEuOHJlbScsIGZvbnRXZWlnaHQ6ICc4MDAnLCBjb2xvcjogJyM5OTFiMWInIH19PntyZXN1bHRQcm9ncmVzcz8uc3VtbWFyeT8ucGVuZGluZyB8fCAwfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgey8qIERldGFpbGVkIFRhYmxlICovfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7c2hvd1VwbG9hZERldGFpbHMgJiYgcmVzdWx0UHJvZ3Jlc3M/LmRldGFpbHMgJiYgcmVzdWx0UHJvZ3Jlc3MuZGV0YWlscy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG92ZXJmbG93WDogJ2F1dG8nLCBtYXJnaW5Ub3A6ICcxMHB4JywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpJyB9fT5cclxuICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJzY2hvb2wtdGFibGVcIiBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBmb250U2l6ZTogJzAuOXJlbScsIG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+Q2xhc3MgQXJtPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+U3ViamVjdDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgcGFkZGluZzogJzE0cHgnIH19PlByb2dyZXNzPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+U3RhdHVzPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+QWN0aW9uPC90aD5cclxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAge3Jlc3VsdFByb2dyZXNzLmRldGFpbHMubWFwKChpdGVtLCBpZHgpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2lkeH0gc3R5bGU9e3sgdHJhbnNpdGlvbjogJ2JhY2tncm91bmQtY29sb3IgMC4ycycsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpJyB9fSBvbk1vdXNlRW50ZXI9eyhlKSA9PiBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwwLDAsMC4wMSknfSBvbk1vdXNlTGVhdmU9eyhlKSA9PiBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J30+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+PHN0cm9uZz57aXRlbS5jbGFzc19uYW1lfTwvc3Ryb25nPjwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+e2l0ZW0uc3ViamVjdF9uYW1lfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcsIHdpZHRoOiAnMjIwcHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnMTBweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZsZXg6IDEsIGhlaWdodDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXNlY29uZGFyeSknLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBvdmVyZmxvdzogJ2hpZGRlbicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke2l0ZW0ucGVyY2VudGFnZX0lYCwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogaXRlbS5zdGF0dXMgPT09ICdDb21wbGV0ZWQnID8gJyMxMGI5ODEnIDogaXRlbS5zdGF0dXMgPT09ICdJbiBQcm9ncmVzcycgPyAnI2Y1OWUwYicgOiAnI2VmNDQ0NCcgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMC44cmVtJywgZm9udFdlaWdodDogJzcwMCcsIG1pbldpZHRoOiAnNDBweCcsIGNvbG9yOiAndmFyKC0tdGV4dC1zZWNvbmRhcnkpJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2l0ZW0udXBsb2FkZWRfY291bnR9L3tpdGVtLnRvdGFsX3N0dWRlbnRzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnLCBwYWRkaW5nOiAnNnB4IDEycHgnLCBib3JkZXJSYWRpdXM6ICcyMHB4JywgZm9udFNpemU6ICcwLjhyZW0nLCBmb250V2VpZ2h0OiAnNjAwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogaXRlbS5zdGF0dXMgPT09ICdDb21wbGV0ZWQnID8gJ3JnYmEoMTYsIDE4NSwgMTI5LCAwLjEpJyA6IGl0ZW0uc3RhdHVzID09PSAnSW4gUHJvZ3Jlc3MnID8gJ3JnYmEoMjQ1LCAxNTgsIDExLCAwLjEpJyA6ICdyZ2JhKDIzOSwgNjgsIDY4LCAwLjEpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBpdGVtLnN0YXR1cyA9PT0gJ0NvbXBsZXRlZCcgPyAnIzEwYjk4MScgOiBpdGVtLnN0YXR1cyA9PT0gJ0luIFByb2dyZXNzJyA/ICcjZDk3NzA2JyA6ICcjZWY0NDQ0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2l0ZW0uc3RhdHVzID09PSAnQ29tcGxldGVkJyA/IDxDaGVja0NpcmNsZTIgc2l6ZT17MTR9IC8+IDogaXRlbS5zdGF0dXMgPT09ICdJbiBQcm9ncmVzcycgPyA8SG91cmdsYXNzIHNpemU9ezE0fSAvPiA6IDxDbG9jayBzaXplPXsxNH0gLz59XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aXRlbS5zdGF0dXN9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tc2Vjb25kYXJ5XCIgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBmb250U2l6ZTogJzAuOHJlbScsIHBhZGRpbmc6ICc2cHggMTRweCcsIGJvcmRlclJhZGl1czogJzZweCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcsIGJvcmRlcjogJzFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpJywgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVNlbGVjdENsYXNzU3ViamVjdEZvckdyYWRlcyh7IGNsYXNzX2lkOiBpdGVtLmNsYXNzX2lkLCBjbGFzc19uYW1lOiBpdGVtLmNsYXNzX25hbWUsIHN1YmplY3RfaWQ6IGl0ZW0uc3ViamVjdF9pZCwgc3ViamVjdF9uYW1lOiBpdGVtLnN1YmplY3RfbmFtZSB9KX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VXBsb2FkQ2xvdWQgc2l6ZT17MTR9IHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tcHJpbWFyeSknIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aXRlbS5zdGF0dXMgPT09ICdDb21wbGV0ZWQnID8gJ1ZpZXcvRWRpdCcgOiAnVXBsb2FkIE1hcmtzJ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdsYXNzLXBhbmVsXCIgc3R5bGU9e3sgcGFkZGluZzogJzI4cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zdXJmYWNlKScsIGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzE2cHgnIH19PlxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAnMS4yNXJlbScsIGNvbG9yOiAndmFyKC0tdGV4dC1wcmltYXJ5KScgfX0+TXkgQXNzaWduZWQgU3ViamVjdHM8L2gzPlxyXG4gICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tdGV4dC1zZWNvbmRhcnkpJywgZm9udFNpemU6ICcwLjlyZW0nLCBtYXJnaW46ICc0cHggMCAwIDAnIH19PlxyXG4gICAgICAgICAgICAgICAgU2VsZWN0IGEgc3ViamVjdCBzdHJlYW0gYmVsb3cgdG8gb3BlbiB0aGUgZ3JhZGluZyBzcHJlYWRzaGVldC5cclxuICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMjIwcHgsIDFmcikpJywgZ2FwOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAge2Fzc2lnbm1lbnRzLnN1YmplY3RzLmxlbmd0aCA9PT0gMCA/IChcclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzIwcHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zZWNvbmRhcnkpJywgYm9yZGVyUmFkaXVzOiAnMTJweCcsIGNvbG9yOiAndmFyKC0tdGV4dC1tdXRlZCknIH19PlxyXG4gICAgICAgICAgICAgICAgICBZb3UgYXJlIG5vdCBjdXJyZW50bHkgYXNzaWduZWQgdG8gdGVhY2ggYW55IHN1YmplY3RzLlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICAgIGFzc2lnbm1lbnRzLnN1YmplY3RzLm1hcCgoYXNzaWduLCBpZHgpID0+IChcclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIGtleT17aWR4fVxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgXHJcbiAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6ICcxMnB4JywgcGFkZGluZzogJzIwcHgnLCB0ZXh0QWxpZ246ICdsZWZ0JywgXHJcbiAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJywgY29sb3I6ICd2YXIoLS10ZXh0LXByaW1hcnkpJywgYm9yZGVyOiAnMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciknLCBcclxuICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLCBjdXJzb3I6ICdwb2ludGVyJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgYm94U2hhZG93OiAnMCAycHggNHB4IHJnYmEoMCwwLDAsMC4wMiknXHJcbiAgICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eyhlKSA9PiB7IGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgtM3B4KSc7IGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3hTaGFkb3cgPSAnMCA2cHggMTJweCByZ2JhKDAsMCwwLDAuMDUpJzsgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJvcmRlckNvbG9yID0gJ3ZhcigtLXByaW1hcnkpJzsgfX1cclxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eyhlKSA9PiB7IGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAnbm9uZSc7IGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3hTaGFkb3cgPSAnMCAycHggNHB4IHJnYmEoMCwwLDAsMC4wMiknOyBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm9yZGVyQ29sb3IgPSAndmFyKC0tYm9yZGVyLWNvbG9yKSc7IH19XHJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlU2VsZWN0Q2xhc3NTdWJqZWN0Rm9yR3JhZGVzKGFzc2lnbil9XHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiAnNzAwJywgZm9udFNpemU6ICcxLjA1cmVtJywgY29sb3I6ICd2YXIoLS1wcmltYXJ5KScgfX0+e2Fzc2lnbi5jbGFzc19uYW1lfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzAuODVyZW0nLCBjb2xvcjogJ3ZhcigtLXRleHQtc2Vjb25kYXJ5KScsIG1hcmdpblRvcDogJzJweCcgfX0+e2Fzc2lnbi5zdWJqZWN0X25hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnLCBmb250U2l6ZTogJzAuOHJlbScsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJ3ZhcigtLXByaW1hcnkpJywgbWFyZ2luVG9wOiAnYXV0bycgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8RWRpdDMgc2l6ZT17MTR9IC8+IEVudGVyIE1hcmtzXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgKSlcclxuICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtcGFuZWxcIiBzdHlsZT17eyBwYWRkaW5nOiAnMjhweCcsIGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXN1cmZhY2UpJywgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogMCwgZm9udFNpemU6ICcxLjI1cmVtJywgY29sb3I6ICd2YXIoLS10ZXh0LXByaW1hcnkpJyB9fT5Gb3JtIE1hc3RlciBTdGF0dXM8L2gzPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAge2Fzc2lnbm1lbnRzLmZvcm1DbGFzcyA/IChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzIwcHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBcclxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSg1OSwgMTMwLCAyNDYsIDAuMDUpJywgY29sb3I6ICd2YXIoLS1wcmltYXJ5KScsIHBhZGRpbmc6ICcyMHB4JywgXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEycHgnLCBib3JkZXI6ICcxcHggc29saWQgcmdiYSg1OSwgMTMwLCAyNDYsIDAuMTUpJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyBcclxuICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcwLjhyZW0nLCBmb250V2VpZ2h0OiAnNjAwJywgdGV4dFRyYW5zZm9ybTogJ3VwcGVyY2FzZScsIGxldHRlclNwYWNpbmc6ICcwLjA1ZW0nIH19PkZvcm0gTWFzdGVyIG9mPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEuNHJlbScsIGZvbnRXZWlnaHQ6ICc4MDAnLCBtYXJnaW5Ub3A6ICc0cHgnIH19Pnthc3NpZ25tZW50cy5mb3JtQ2xhc3MubmFtZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc0OHB4JywgaGVpZ2h0OiAnNDhweCcsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoNTksIDEzMCwgMjQ2LCAwLjE1KScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8VXNlcnMgc2l6ZT17MjR9IHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tcHJpbWFyeSknIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBjb2xvcjogJ3ZhcigtLXRleHQtc2Vjb25kYXJ5KScsIGZvbnRTaXplOiAnMC45cmVtJywgbWFyZ2luOiAwLCBsaW5lSGVpZ2h0OiAnMS41JyB9fT5cclxuICAgICAgICAgICAgICAgICAgQXMgRm9ybSBNYXN0ZXIsIHlvdSBoYXZlIGFjY2VzcyB0byBkYWlseSBhdHRlbmRhbmNlIGNoZWNrbGlzdHMgYW5kIHRoZSBjb21wbGV0ZSBjbGFzcyBicm9hZHNoZWV0IGZvciBhY2FkZW1pYyByZXZpZXdzLlxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIHN0eWxlPXt7IHBhZGRpbmc6ICcxMHB4IDIwcHgnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnIH19IG9uQ2xpY2s9eygpID0+IHsgc2V0QWN0aXZlU3ViVGFiKCdhdHRlbmRhbmNlJyk7IGZldGNoQXR0ZW5kYW5jZShhc3NpZ25tZW50cy5mb3JtQ2xhc3MuaWQsIGF0dGVuZGFuY2VEYXRlKTsgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPENoZWNrU3F1YXJlIHNpemU9ezE2fSAvPiBNYXJrIEF0dGVuZGFuY2VcclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIiBzdHlsZT17eyBwYWRkaW5nOiAnMTBweCAyMHB4JywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsIGJvcmRlcjogJzFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpJyB9fSBvbkNsaWNrPXsoKSA9PiB7IHNldEFjdGl2ZVN1YlRhYignYnJvYWRzaGVldCcpOyBmZXRjaEJyb2Fkc2hlZXQoYXNzaWdubWVudHMuZm9ybUNsYXNzLmlkKTsgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPEZpbGVTcHJlYWRzaGVldCBzaXplPXsxNn0gLz4gVmlldyBDbGFzcyBSZXN1bHRzXHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tc2Vjb25kYXJ5XCIgc3R5bGU9e3sgcGFkZGluZzogJzEwcHggMjBweCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJyNmZmYnLCBib3JkZXI6ICcxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKScgfX0gb25DbGljaz17KCkgPT4geyBzZXRBY3RpdmVTdWJUYWIoJ2JlaGF2aW9yYWwnKTsgbG9hZEJlaGF2aW9yYWxSb3N0ZXIoKTsgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPEF3YXJkIHNpemU9ezE2fSAvPiBFdmFsdWF0ZSBQc3ljaG9tb3RvclxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzIwcHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zZWNvbmRhcnkpJywgYm9yZGVyUmFkaXVzOiAnMTJweCcsIGNvbG9yOiAndmFyKC0tdGV4dC1tdXRlZCknIH19PlxyXG4gICAgICAgICAgICAgICAgWW91IGFyZSBub3QgY3VycmVudGx5IGFzc2lnbmVkIGFzIGEgQ2xhc3MgVGVhY2hlciBmb3IgYW55IGNsYXNzLlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgICAgICAgVEFCIDI6IEdSQURFUyBFTlRSWSBTSEVFVCAoU1BSRUFEU0hFRVQgTEFZT1VUKVxyXG4gICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7YWN0aXZlU3ViVGFiID09PSAnZ3JhZGVzJyAmJiAhc2VsZWN0ZWRDbGFzc1N1YmplY3QgJiYgKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtcGFuZWxcIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zdXJmYWNlKScsIG92ZXJmbG93OiAnaGlkZGVuJyB9fT5cclxuICAgICAgICAgIHsvKiBQcmVtaXVtIEhlYWRlciAqL31cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZmxleFdyYXA6ICd3cmFwJywgZ2FwOiAnMTVweCcsIGJhY2tncm91bmQ6ICdsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB2YXIoLS1wcmltYXJ5KSAwJSwgIzFlM2E4YSAxMDAlKScsIHBhZGRpbmc6ICcyNHB4JywgY29sb3I6ICd3aGl0ZScsIGJveFNoYWRvdzogJzAgNHB4IDE1cHggcmdiYSgwLDAsMCwwLjEpJyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICcxNXB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnNDhweCcsIGhlaWdodDogJzQ4cHgnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJywgYmFja2Ryb3BGaWx0ZXI6ICdibHVyKDEwcHgpJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBib3JkZXI6ICcycHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjQpJyB9fT5cclxuICAgICAgICAgICAgICAgIDxFZGl0MyBzaXplPXsyNH0gY29sb3I9XCJ3aGl0ZVwiIC8+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAnMS4yNXJlbScsIGZvbnRXZWlnaHQ6ICc3MDAnIH19PkVudGVyIE1hcmtzPC9oMz5cclxuICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwwLjg1KScsIGZvbnRTaXplOiAnMC44NXJlbScsIG1hcmdpbjogJzRweCAwIDAgMCcgfX0+U2VsZWN0IGEgc3ViamVjdCBiZWxvdyB0byBvcGVuIHRoZSBncmFkaW5nIHNwcmVhZHNoZWV0LjwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScsIGJvcmRlclJhZGl1czogJzIwcHgnLCBwYWRkaW5nOiAnOHB4IDE2cHgnLCBmb250U2l6ZTogJzAuODJyZW0nLCBmb250V2VpZ2h0OiAnNjAwJyB9fT5cclxuICAgICAgICAgICAgICA8RmlsZVRleHQgc2l6ZT17MTR9IC8+IHthc3NpZ25tZW50cy5zdWJqZWN0cy5sZW5ndGh9IHN1YmplY3R7YXNzaWdubWVudHMuc3ViamVjdHMubGVuZ3RoICE9PSAxID8gJ3MnIDogJyd9IGFzc2lnbmVkXHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcyNHB4JyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maWxsLCBtaW5tYXgoMjIwcHgsIDFmcikpJywgZ2FwOiAnMTZweCcgfX0+XHJcbiAgICAgICAgICAgICAge2Fzc2lnbm1lbnRzLnN1YmplY3RzLmxlbmd0aCA9PT0gMCA/IChcclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZ3JpZENvbHVtbjogJzEvLTEnLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgcGFkZGluZzogJzQwcHgnLCBnYXA6ICcxMnB4JywgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPEZpbGVUZXh0IHNpemU9ezQwfSBzdHlsZT17eyBvcGFjaXR5OiAwLjMgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICd2YXIoLS10ZXh0LW11dGVkKScsIG1hcmdpbjogMCB9fT5Zb3UgYXJlIG5vdCBjdXJyZW50bHkgYXNzaWduZWQgdG8gdGVhY2ggYW55IHN1YmplY3RzLjwvcD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgICAgICBhc3NpZ25tZW50cy5zdWJqZWN0cy5tYXAoKGFzc2lnbiwgaWR4KSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICBrZXk9e2lkeH1cclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIlxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzEwcHgnLCBwYWRkaW5nOiAnMjBweCcsIHRleHRBbGlnbjogJ2xlZnQnLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDIxNywxMTksNiwwLjA1KScsIGNvbG9yOiAndmFyKC0tdGV4dC1wcmltYXJ5KScsIGJvcmRlcjogJzEuNXB4IHNvbGlkIHJnYmEoMjE3LDExOSw2LDAuMiknLCBib3JkZXJSYWRpdXM6ICcxMnB4JywgY3Vyc29yOiAncG9pbnRlcicsIHRyYW5zaXRpb246ICdhbGwgMC4ycycgfX1cclxuICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eyhlKSA9PiB7IGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgyMTcsMTE5LDYsMC4xMiknOyBlLmN1cnJlbnRUYXJnZXQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoLTJweCknOyBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYm94U2hhZG93ID0gJzAgNHB4IDEycHggcmdiYSgyMTcsMTE5LDYsMC4xNSknOyB9fVxyXG4gICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KGUpID0+IHsgZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDIxNywxMTksNiwwLjA1KSc7IGUuY3VycmVudFRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSAnbm9uZSc7IGUuY3VycmVudFRhcmdldC5zdHlsZS5ib3hTaGFkb3cgPSAnbm9uZSc7IH19XHJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlU2VsZWN0Q2xhc3NTdWJqZWN0Rm9yR3JhZGVzKGFzc2lnbil9XHJcbiAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzEwcHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzM2cHgnLCBoZWlnaHQ6ICczNnB4JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAncmdiYSgyMTcsMTE5LDYsMC4xNSknLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGZsZXhTaHJpbms6IDAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxCb29rT3BlbiBzaXplPXsxOH0gc3R5bGU9e3sgY29sb3I6ICcjZDk3NzA2JyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc3MDAnLCBmb250U2l6ZTogJzAuOTVyZW0nIH19Pnthc3NpZ24uc3ViamVjdF9uYW1lfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMC43OHJlbScsIGNvbG9yOiAndmFyKC0tdGV4dC1zZWNvbmRhcnkpJyB9fT57YXNzaWduLmNsYXNzX25hbWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcsIGZvbnRTaXplOiAnMC44MnJlbScsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyNkOTc3MDYnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPEVkaXQzIHNpemU9ezEzfSAvPiBFbnRlciBNYXJrcyDihpJcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICApKVxyXG4gICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7YWN0aXZlU3ViVGFiID09PSAnZ3JhZGVzJyAmJiBzZWxlY3RlZENsYXNzU3ViamVjdCAmJiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1wYW5lbFwiIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXN1cmZhY2UpJywgb3ZlcmZsb3c6ICdoaWRkZW4nIH19PlxyXG4gICAgICAgICAgey8qIFByZW1pdW0gSGVhZGVyICovfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICcxNXB4JywgYmFja2dyb3VuZDogJ2xpbmVhci1ncmFkaWVudCgxMzVkZWcsIHZhcigtLXByaW1hcnkpIDAlLCAjMWUzYThhIDEwMCUpJywgcGFkZGluZzogJzI0cHgnLCBjb2xvcjogJ3doaXRlJywgYm94U2hhZG93OiAnMCA0cHggMTVweCByZ2JhKDAsMCwwLDAuMSknIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzE1cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBuby1wcmludFwiXHJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7IHNldFNlbGVjdGVkQ2xhc3NTdWJqZWN0KG51bGwpOyBzZXRBY3RpdmVTdWJUYWIoJ292ZXJ2aWV3Jyk7IH19XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzQwcHgnLCBoZWlnaHQ6ICc0MHB4JywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZENvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwwLjE1KScsIGJvcmRlcjogJzEuNXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC40KScsIGNvbG9yOiAnd2hpdGUnLCBjdXJzb3I6ICdwb2ludGVyJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBmbGV4U2hyaW5rOiAwLCBmb250U2l6ZTogJzEuMXJlbScsIHRyYW5zaXRpb246ICdhbGwgMC4ycycgfX1cclxuICAgICAgICAgICAgICAgIHRpdGxlPVwiQmFjayB0byBvdmVydmlld1wiXHJcbiAgICAgICAgICAgICAgPuKGkDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc0OHB4JywgaGVpZ2h0OiAnNDhweCcsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknLCBiYWNrZHJvcEZpbHRlcjogJ2JsdXIoMTBweCknLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuNCknIH19PlxyXG4gICAgICAgICAgICAgICAgPEVkaXQzIHNpemU9ezI0fSBjb2xvcj1cIndoaXRlXCIgLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogMCwgZm9udFNpemU6ICcxLjI1cmVtJywgZm9udFdlaWdodDogJzcwMCcgfX0+e3NlbGVjdGVkQ2xhc3NTdWJqZWN0LnN1YmplY3RfbmFtZX08L2gzPlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuODUpJywgZm9udFNpemU6ICcwLjg1cmVtJywgbWFyZ2luOiAnNHB4IDAgMCAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2xhc3NTdWJqZWN0LmNsYXNzX25hbWV9IMK3IHtzZXR0aW5ncy5hY3RpdmVfdGVybX0gwrcge3NldHRpbmdzLmFjdGl2ZV9zZXNzaW9ufVxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgeyFzZXR0aW5ncy5yZXN1bHRfZW50cnlfb3BlbiA/IChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMCwwLDAsMC4yKScsIGJvcmRlclJhZGl1czogJzIwcHgnLCBwYWRkaW5nOiAnOHB4IDE2cHgnLCBmb250U2l6ZTogJzAuODJyZW0nLCBmb250V2VpZ2h0OiAnNzAwJywgYm9yZGVyOiAnMXB4IGRhc2hlZCByZ2JhKDI1NSwyNTUsMjU1LDAuMyknIH19PlxyXG4gICAgICAgICAgICAgICAgPExvY2sgc2l6ZT17MTR9IC8+IExvY2tlZCBieSBBZG1pblxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBuby1wcmludFwiXHJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVTYXZlR3JhZGVzfVxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JywgYmFja2dyb3VuZENvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwwLjIpJywgYmFja2Ryb3BGaWx0ZXI6ICdibHVyKDVweCknLCBib3JkZXI6ICcxLjVweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuNSknLCBjb2xvcjogJ3doaXRlJywgcGFkZGluZzogJzEwcHggMjBweCcsIGJvcmRlclJhZGl1czogJzIwcHgnLCBmb250V2VpZ2h0OiAnNzAwJywgY3Vyc29yOiAncG9pbnRlcicsIHRyYW5zaXRpb246ICdhbGwgMC4ycycgfX1cclxuICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KGUpID0+IGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjMpJ31cclxuICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KGUpID0+IGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjIpJ31cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICA8U2F2ZSBzaXplPXsxNn0gLz4gU2F2ZSBNYXJrc1xyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMjRweCcgfX0+XHJcbiAgICAgICAgICAgIHsvKiBTdHVkZW50IFNlYXJjaCAqL31cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICcyMHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBtYXhXaWR0aDogJzM2MHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxTZWFyY2ggc2l6ZT17MTZ9IHN0eWxlPXt7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBsZWZ0OiAnMTJweCcsIHRvcDogJzUwJScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTUwJSknLCBjb2xvcjogJ3ZhcigtLXRleHQtbXV0ZWQpJyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCJcclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZ0xlZnQ6ICczNnB4JyB9fVxyXG4gICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlYXJjaCBzdHVkZW50IGJ5IG5hbWUgb3IgYWRtaXNzaW9uIG5vLi4uXCJcclxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2dyYWRlc1NlYXJjaH1cclxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRHcmFkZXNTZWFyY2goZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyYWRlLXRhYmxlLWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJncmFkZS1lbnRyeS10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoPlN0dWRlbnQgTmFtZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoPkFkbWlzc2lvbiBObzwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgeyghc2V0dGluZ3MubWF4X2NhX2NvdW50IHx8IHNldHRpbmdzLm1heF9jYV9jb3VudCA+PSAxKSAmJiA8dGggc3R5bGU9e3sgd2lkdGg6ICc5MHB4JyB9fT57c2V0dGluZ3MuY2ExX25hbWUgfHwgJ0NBIDEnfSAoMTApPC90aD59XHJcbiAgICAgICAgICAgICAgICAgICAgeyghc2V0dGluZ3MubWF4X2NhX2NvdW50IHx8IHNldHRpbmdzLm1heF9jYV9jb3VudCA+PSAyKSAmJiA8dGggc3R5bGU9e3sgd2lkdGg6ICc5MHB4JyB9fT57c2V0dGluZ3MuY2EyX25hbWUgfHwgJ0NBIDInfSAoMTApPC90aD59XHJcbiAgICAgICAgICAgICAgICAgICAgeyghc2V0dGluZ3MubWF4X2NhX2NvdW50IHx8IHNldHRpbmdzLm1heF9jYV9jb3VudCA+PSAzKSAmJiA8dGggc3R5bGU9e3sgd2lkdGg6ICc5MHB4JyB9fT57c2V0dGluZ3MuY2EzX25hbWUgfHwgJ0NBIDMnfSAoMTApPC90aD59XHJcbiAgICAgICAgICAgICAgICAgICAgeyghc2V0dGluZ3MubWF4X2NhX2NvdW50IHx8IHNldHRpbmdzLm1heF9jYV9jb3VudCA+PSA0KSAmJiA8dGggc3R5bGU9e3sgd2lkdGg6ICc5MHB4JyB9fT57c2V0dGluZ3MuY2E0X25hbWUgfHwgJ0NBIDQnfSAoMTApPC90aD59XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHdpZHRoOiAnMTEwcHgnIH19PntzZXR0aW5ncy5leGFtX25hbWUgfHwgJ0V4YW0nfSAoNjApPC90aD5cclxuICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgd2lkdGg6ICc5MHB4JywgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5Ub3RhbCAoMTAwKTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHdpZHRoOiAnOTBweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+R3JhZGU8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aD5SZW1hcmtzPC90aD5cclxuICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgIHtzdHVkZW50c0dyYWRlcy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRkIGNvbFNwYW49ezEwfSBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInLCBjb2xvcjogJ3ZhcigtLXRleHQtbXV0ZWQpJyB9fT5ObyBzdHVkZW50cyByZWdpc3RlcmVkIGluIHRoaXMgY2xhc3MuPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzR3JhZGVzLmZpbHRlcihnID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBnLmZ1bGxfbmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGdyYWRlc1NlYXJjaC50b0xvd2VyQ2FzZSgpKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgZy5hZG1pc3Npb25fbnVtYmVyLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZ3JhZGVzU2VhcmNoLnRvTG93ZXJDYXNlKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgKS5tYXAoKGcsIGlkeCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aWR4fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJ3ZhcigtLXRleHQtcHJpbWFyeSknIH19PntnLmZ1bGxfbmFtZX08L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+PGNvZGU+e2cuYWRtaXNzaW9uX251bWJlcn08L2NvZGU+PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgeyghc2V0dGluZ3MubWF4X2NhX2NvdW50IHx8IHNldHRpbmdzLm1heF9jYV9jb3VudCA+PSAxKSAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBtaW49XCIwXCIgbWF4PVwiMTBcIiBjbGFzc05hbWU9XCJncmFkZS1pbnB1dFwiIHZhbHVlPXtnLmNhMSA/PyAwfSBvbkNoYW5nZT17KGUpID0+IGhhbmRsZUdyYWRlRmllbGRDaGFuZ2UoZy5zdHVkZW50X2lkLCAnY2ExJywgZS50YXJnZXQudmFsdWUpfSBkaXNhYmxlZD17IXNldHRpbmdzLnJlc3VsdF9lbnRyeV9vcGVufSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHsoIXNldHRpbmdzLm1heF9jYV9jb3VudCB8fCBzZXR0aW5ncy5tYXhfY2FfY291bnQgPj0gMikgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgbWluPVwiMFwiIG1heD1cIjEwXCIgY2xhc3NOYW1lPVwiZ3JhZGUtaW5wdXRcIiB2YWx1ZT17Zy5jYTIgPz8gMH0gb25DaGFuZ2U9eyhlKSA9PiBoYW5kbGVHcmFkZUZpZWxkQ2hhbmdlKGcuc3R1ZGVudF9pZCwgJ2NhMicsIGUudGFyZ2V0LnZhbHVlKX0gZGlzYWJsZWQ9eyFzZXR0aW5ncy5yZXN1bHRfZW50cnlfb3Blbn0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7KCFzZXR0aW5ncy5tYXhfY2FfY291bnQgfHwgc2V0dGluZ3MubWF4X2NhX2NvdW50ID49IDMpICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG1pbj1cIjBcIiBtYXg9XCIxMFwiIGNsYXNzTmFtZT1cImdyYWRlLWlucHV0XCIgdmFsdWU9e2cuY2EzID8/IDB9IG9uQ2hhbmdlPXsoZSkgPT4gaGFuZGxlR3JhZGVGaWVsZENoYW5nZShnLnN0dWRlbnRfaWQsICdjYTMnLCBlLnRhcmdldC52YWx1ZSl9IGRpc2FibGVkPXshc2V0dGluZ3MucmVzdWx0X2VudHJ5X29wZW59IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgeyghc2V0dGluZ3MubWF4X2NhX2NvdW50IHx8IHNldHRpbmdzLm1heF9jYV9jb3VudCA+PSA0KSAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBtaW49XCIwXCIgbWF4PVwiMTBcIiBjbGFzc05hbWU9XCJncmFkZS1pbnB1dFwiIHZhbHVlPXtnLmNhNCA/PyAwfSBvbkNoYW5nZT17KGUpID0+IGhhbmRsZUdyYWRlRmllbGRDaGFuZ2UoZy5zdHVkZW50X2lkLCAnY2E0JywgZS50YXJnZXQudmFsdWUpfSBkaXNhYmxlZD17IXNldHRpbmdzLnJlc3VsdF9lbnRyeV9vcGVufSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIG1pbj1cIjBcIiBtYXg9XCI2MFwiIGNsYXNzTmFtZT1cImdyYWRlLWlucHV0XCIgdmFsdWU9e2cuZXhhbV9zY29yZSA/PyAwfSBvbkNoYW5nZT17KGUpID0+IGhhbmRsZUdyYWRlRmllbGRDaGFuZ2UoZy5zdHVkZW50X2lkLCAnZXhhbV9zY29yZScsIGUudGFyZ2V0LnZhbHVlKX0gZGlzYWJsZWQ9eyFzZXR0aW5ncy5yZXN1bHRfZW50cnlfb3Blbn0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZ3JhZGUtdG90YWwtY29sXCI+e2cudG90YWxfc2NvcmUgPz8gMH08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGdyYWRlLWJhZGdlICR7Zy5ncmFkZV9sZXR0ZXIgPT09ICdGJyA/ICdncmFkZS1iYWRnZS1mYWlsJyA6ICdncmFkZS1iYWRnZS1wYXNzJ31gfT57Zy5ncmFkZV9sZXR0ZXIgfHwgJy0nfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cImdyYWRlLXJlbWFyay1pbnB1dFwiIHZhbHVlPXtnLnJlbWFyayB8fCAnJ30gb25DaGFuZ2U9eyhlKSA9PiBoYW5kbGVHcmFkZUZpZWxkQ2hhbmdlKGcuc3R1ZGVudF9pZCwgJ3JlbWFyaycsIGUudGFyZ2V0LnZhbHVlKX0gZGlzYWJsZWQ9eyFzZXR0aW5ncy5yZXN1bHRfZW50cnlfb3Blbn0gcGxhY2Vob2xkZXI9XCJBdXRvIHJlbWFyay4uLlwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgICAgICBUQUIgMzogQ0xBU1MgQVRURU5EQU5DRSBTSEVFVCAoRk9STSBNQVNURVIpXHJcbiAgICAgICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi99XHJcbiAgICAgIHthY3RpdmVTdWJUYWIgPT09ICdhdHRlbmRhbmNlJyAmJiAhYXNzaWdubWVudHMuZm9ybUNsYXNzICYmIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdsYXNzLXBhbmVsXCIgc3R5bGU9e3sgcGFkZGluZzogJzI4cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zdXJmYWNlKScgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIHBhZGRpbmc6ICc0MHB4JywgZ2FwOiAnMTZweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc2NHB4JywgaGVpZ2h0OiAnNjRweCcsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoNTksMTMwLDI0NiwwLjEpJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICAgIDxDaGVja1NxdWFyZSBzaXplPXszMn0gc3R5bGU9e3sgY29sb3I6ICd2YXIoLS1wcmltYXJ5KScgfX0gLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46IDAsIGNvbG9yOiAndmFyKC0tdGV4dC1wcmltYXJ5KScgfX0+Q2xhc3MgQXR0ZW5kYW5jZTwvaDM+XHJcbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tdGV4dC1tdXRlZCknLCBtYXhXaWR0aDogJzQwMHB4JywgbWFyZ2luOiAwIH19PllvdSBtdXN0IGJlIGFzc2lnbmVkIGFzIGEgRm9ybSBNYXN0ZXIgdG8gbWFuYWdlIGNsYXNzIGF0dGVuZGFuY2UuPC9wPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcbiAgICAgIHthY3RpdmVTdWJUYWIgPT09ICdhdHRlbmRhbmNlJyAmJiBhc3NpZ25tZW50cy5mb3JtQ2xhc3MgJiYgKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtcGFuZWxcIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zdXJmYWNlKScsIG92ZXJmbG93OiAnaGlkZGVuJyB9fT5cclxuICAgICAgICAgIHsvKiBQcmVtaXVtIEhlYWRlciAqL31cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZmxleFdyYXA6ICd3cmFwJywgZ2FwOiAnMTVweCcsIGJhY2tncm91bmQ6ICdsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB2YXIoLS1wcmltYXJ5KSAwJSwgIzFlM2E4YSAxMDAlKScsIHBhZGRpbmc6ICcyNHB4JywgY29sb3I6ICd3aGl0ZScsIGJveFNoYWRvdzogJzAgNHB4IDE1cHggcmdiYSgwLDAsMCwwLjEpJyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICcxNXB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnNDhweCcsIGhlaWdodDogJzQ4cHgnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJywgYmFja2Ryb3BGaWx0ZXI6ICdibHVyKDEwcHgpJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBib3JkZXI6ICcycHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjQpJyB9fT5cclxuICAgICAgICAgICAgICAgIDxDaGVja1NxdWFyZSBzaXplPXsyNH0gY29sb3I9XCJ3aGl0ZVwiIC8+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAnMS4yNXJlbScsIGZvbnRXZWlnaHQ6ICc3MDAnIH19PkNsYXNzIEF0dGVuZGFuY2U6IHthc3NpZ25tZW50cy5mb3JtQ2xhc3MubmFtZX08L2gzPlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuODUpJywgZm9udFNpemU6ICcwLjg1cmVtJywgbWFyZ2luOiAnNHB4IDAgMCAwJyB9fT5UcmFjayBkYWlseSBhdHRlbmRhbmNlIGFuZCBnZW5lcmF0ZSBzdW1tYXJ5IHJlcG9ydHMuPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMjRweCcgfX0+XHJcbiAgICAgICAgICB7LyogU3ViIE5hdmlnYXRpb24gZm9yIEF0dGVuZGFuY2UgKi99XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnOHB4JywgbWFyZ2luQm90dG9tOiAnMjRweCcgfX0gY2xhc3NOYW1lPVwibm8tcHJpbnRcIj5cclxuICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZUF0dGVuZGFuY2VTdWJUYWIoJ3Rha2UnKX1cclxuICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxOHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGFjdGl2ZUF0dGVuZGFuY2VTdWJUYWIgPT09ICd0YWtlJyA/ICd2YXIoLS1wcmltYXJ5KScgOiAndHJhbnNwYXJlbnQnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnMXB4IHNvbGlkICcgKyAoYWN0aXZlQXR0ZW5kYW5jZVN1YlRhYiA9PT0gJ3Rha2UnID8gJ3ZhcigtLXByaW1hcnkpJyA6ICd2YXIoLS1ib3JkZXItY29sb3IpJyksXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcyMHB4JyxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiBhY3RpdmVBdHRlbmRhbmNlU3ViVGFiID09PSAndGFrZScgPyAnI2ZmZicgOiAndmFyKC0tdGV4dC1zZWNvbmRhcnkpJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzAuODhyZW0nLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJ1xyXG4gICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICBUYWtlIEF0dGVuZGFuY2VcclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVBdHRlbmRhbmNlU3ViVGFiKCdyZXBvcnQnKX1cclxuICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzhweCAxOHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGFjdGl2ZUF0dGVuZGFuY2VTdWJUYWIgPT09ICdyZXBvcnQnID8gJ3ZhcigtLXByaW1hcnkpJyA6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICcxcHggc29saWQgJyArIChhY3RpdmVBdHRlbmRhbmNlU3ViVGFiID09PSAncmVwb3J0JyA/ICd2YXIoLS1wcmltYXJ5KScgOiAndmFyKC0tYm9yZGVyLWNvbG9yKScpLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogYWN0aXZlQXR0ZW5kYW5jZVN1YlRhYiA9PT0gJ3JlcG9ydCcgPyAnI2ZmZicgOiAndmFyKC0tdGV4dC1zZWNvbmRhcnkpJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzAuODhyZW0nLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJ1xyXG4gICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICBBdHRlbmRhbmNlIFJlcG9ydFxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIHthY3RpdmVBdHRlbmRhbmNlU3ViVGFiID09PSAndGFrZScgPyAoXHJcbiAgICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIGFsaWduSXRlbXM6ICdmbGV4LXN0YXJ0JywgbWFyZ2luQm90dG9tOiAnMjBweCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICd2YXIoLS10ZXh0LXNlY29uZGFyeSknLCBmb250U2l6ZTogJzAuOXJlbScsIG1hcmdpbjogMCB9fT5TZWxlY3QgdGhlIGRhdGUgYW5kIG1hcmsgZWFjaCBzdHVkZW50J3Mgcm9sbCBjYWxsIHN0YXR1cy48L3A+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnMTJweCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19IGNsYXNzTmFtZT1cIm5vLXByaW50XCI+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIlxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiAnMTcwcHgnIH19XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2F0dGVuZGFuY2VEYXRlfVxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4geyBzZXRBdHRlbmRhbmNlRGF0ZShlLnRhcmdldC52YWx1ZSk7IGZldGNoQXR0ZW5kYW5jZShhc3NpZ25tZW50cy5mb3JtQ2xhc3MuaWQsIGUudGFyZ2V0LnZhbHVlKTsgfX1cclxuICAgICAgICAgICAgICAgICAgICBtaW49eyFzZXR0aW5ncy5hbGxvd19wYXN0X2F0dGVuZGFuY2UgPyBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSA6IHVuZGVmaW5lZH1cclxuICAgICAgICAgICAgICAgICAgICBtYXg9eyFzZXR0aW5ncy5hbGxvd19wYXN0X2F0dGVuZGFuY2UgPyBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXSA6IHVuZGVmaW5lZH1cclxuICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnIH19IG9uQ2xpY2s9e2hhbmRsZVNhdmVBdHRlbmRhbmNlfT48U2F2ZSBzaXplPXsxNX0gLz4gU2F2ZSBBdHRlbmRhbmNlPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgey8qIEF0dGVuZGFuY2UgU2VhcmNoICovfVxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICcxNXB4JywgbWFyZ2luQm90dG9tOiAnMjBweCcgfX0gY2xhc3NOYW1lPVwibm8tcHJpbnRcIj5cclxuICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiXHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IG1heFdpZHRoOiAnMzAwcHgnLCBwYWRkaW5nOiAnMTBweCcgfX1cclxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggc3R1ZGVudCBieSBuYW1lLi4uXCJcclxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2F0dGVuZGFuY2VTZWFyY2h9XHJcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0QXR0ZW5kYW5jZVNlYXJjaChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG92ZXJmbG93WDogJ2F1dG8nLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciknIH19PlxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInNjaG9vbC10YWJsZVwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+U3R1ZGVudCBOYW1lPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+QWRtaXNzaW9uIE51bWJlcjwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgcGFkZGluZzogJzE0cHgnIH19PlJvbGwgQ2FsbCBTdGF0dXM8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICB7YXR0ZW5kYW5jZVJvc3Rlci5maWx0ZXIociA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgci5mdWxsX25hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhhdHRlbmRhbmNlU2VhcmNoLnRvTG93ZXJDYXNlKCkpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICByLmFkbWlzc2lvbl9udW1iZXIudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhhdHRlbmRhbmNlU2VhcmNoLnRvTG93ZXJDYXNlKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgKS5tYXAoKHIsIGlkeCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aWR4fSBzdHlsZT17eyB0cmFuc2l0aW9uOiAnYmFja2dyb3VuZC1jb2xvciAwLjJzJywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciknIH19IG9uTW91c2VFbnRlcj17KGUpID0+IGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgwLDAsMCwwLjAxKSd9IG9uTW91c2VMZWF2ZT17KGUpID0+IGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc2MDAnLCBwYWRkaW5nOiAnMTRweCcgfX0+e3IuZnVsbF9uYW1lfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+PGNvZGUgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAndmFyKC0tYmctc2Vjb25kYXJ5KScsIHBhZGRpbmc6ICczcHggOHB4JywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcwLjgycmVtJyB9fT57ci5hZG1pc3Npb25fbnVtYmVyfTwvY29kZT48L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlQXR0ZW5kYW5jZUNoYW5nZShyLnN0dWRlbnRfaWQsICdwcmVzZW50Jyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0blwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzZweCAxNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzAuOHJlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiByLnN0YXR1cyA9PT0gJ3ByZXNlbnQnIHx8ICFyLnN0YXR1cyA/ICcjMTBiOTgxJyA6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHIuc3RhdHVzID09PSAncHJlc2VudCcgfHwgIXIuc3RhdHVzID8gJyNmZmYnIDogJyMxMGI5ODEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzEuNXB4IHNvbGlkICMxMGI5ODEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycyBlYXNlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICDinJMgUHJlc2VudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVBdHRlbmRhbmNlQ2hhbmdlKHIuc3R1ZGVudF9pZCwgJ2Fic2VudCcpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc2cHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcwLjhyZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogci5zdGF0dXMgPT09ICdhYnNlbnQnID8gJyNlZjQ0NDQnIDogJ3RyYW5zcGFyZW50JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogci5zdGF0dXMgPT09ICdhYnNlbnQnID8gJyNmZmYnIDogJyNlZjQ0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzEuNXB4IHNvbGlkICNlZjQ0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICc2MDAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdhbGwgMC4ycyBlYXNlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICDinJUgQWJzZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZUF0dGVuZGFuY2VDaGFuZ2Uoci5zdHVkZW50X2lkLCAnbGF0ZScpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJidG5cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc2cHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcwLjhyZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogci5zdGF0dXMgPT09ICdsYXRlJyA/ICcjZjU5ZTBiJyA6ICd0cmFuc3BhcmVudCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHIuc3RhdHVzID09PSAnbGF0ZScgPyAnI2ZmZicgOiAnI2Y1OWUwYicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMS41cHggc29saWQgI2Y1OWUwYicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2FsbCAwLjJzIGVhc2UnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKPsCBMYXRlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8Lz5cclxuICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIGFsaWduSXRlbXM6ICdmbGV4LXN0YXJ0JywgbWFyZ2luQm90dG9tOiAnMjBweCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzEycHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICd2YXIoLS10ZXh0LXNlY29uZGFyeSknLCBmb250U2l6ZTogJzAuOXJlbScsIG1hcmdpbjogMCB9fT5TZWxlY3QgYSBkYXRlIHJhbmdlIHRvIHZpZXcgc3R1ZGVudCBhdHRlbmRhbmNlIHN1bW1hcnkuPC9wPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzEwcHgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9fSBjbGFzc05hbWU9XCJuby1wcmludFwiPlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcwLjhyZW0nLCBmb250V2VpZ2h0OiAnNjAwJywgY29sb3I6ICd2YXIoLS10ZXh0LXNlY29uZGFyeSknIH19PkZyb206PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZGF0ZVwiIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIHN0eWxlPXt7IHdpZHRoOiAnMTUwcHgnLCBwYWRkaW5nOiAnNnB4JyB9fSB2YWx1ZT17YXR0ZW5kYW5jZVJlcG9ydFN0YXJ0RGF0ZX0gb25DaGFuZ2U9eyhlKSA9PiBzZXRBdHRlbmRhbmNlUmVwb3J0U3RhcnREYXRlKGUudGFyZ2V0LnZhbHVlKX0gLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNnB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzAuOHJlbScsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJ3ZhcigtLXRleHQtc2Vjb25kYXJ5KScgfX0+VG86PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZGF0ZVwiIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIHN0eWxlPXt7IHdpZHRoOiAnMTUwcHgnLCBwYWRkaW5nOiAnNnB4JyB9fSB2YWx1ZT17YXR0ZW5kYW5jZVJlcG9ydEVuZERhdGV9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0QXR0ZW5kYW5jZVJlcG9ydEVuZERhdGUoZS50YXJnZXQudmFsdWUpfSAvPlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXNlY29uZGFyeSBuby1wcmludFwiIHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcgfX0gb25DbGljaz17aGFuZGxlRG93bmxvYWRBdHRlbmRhbmNlUERGfT48RG93bmxvYWQgc2l6ZT17MTV9IC8+IERvd25sb2FkIFBERjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiByZWY9e2F0dGVuZGFuY2VSZXBvcnRSZWZ9IHN0eWxlPXt7IG92ZXJmbG93WDogJ2F1dG8nLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciknLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJywgcGFkZGluZzogJzEwcHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInNjaG9vbC10YWJsZVwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+U3R1ZGVudCBOYW1lPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+QWRtaXNzaW9uIE51bWJlcjwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogJzE0cHgnIH19PlByZXNlbnQ8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICcxNHB4JyB9fT5BYnNlbnQ8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICcxNHB4JyB9fT5MYXRlPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInLCBwYWRkaW5nOiAnMTRweCcgfX0+VG90YWwgRGF5czwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogJzE0cHgnIH19PkF0dGVuZGFuY2UgJTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIHthdHRlbmRhbmNlUmVwb3J0Lmxlbmd0aCA9PT0gMCA/IChcclxuICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNvbFNwYW49XCI3XCIgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogJzQwcHgnLCBjb2xvcjogJ3ZhcigtLXRleHQtbXV0ZWQpJyB9fT5ObyBhdHRlbmRhbmNlIHJlY29yZHMgZm91bmQgZm9yIHRoaXMgcGVyaW9kLjwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICBhdHRlbmRhbmNlUmVwb3J0Lm1hcCgociwgaWR4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdGlvID0gci50b3RhbF9kYXlzID4gMCA/IE1hdGgucm91bmQoKHIucHJlc2VudF9jb3VudCAvIHIudG90YWxfZGF5cykgKiAxMDApIDogMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtpZHh9IHN0eWxlPXt7IHRyYW5zaXRpb246ICdiYWNrZ3JvdW5kLWNvbG9yIDAuMnMnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKScgfX0gb25Nb3VzZUVudGVyPXsoZSkgPT4gZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDAsMCwwLDAuMDEpJ30gb25Nb3VzZUxlYXZlPXsoZSkgPT4gZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCd9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc2MDAnLCBwYWRkaW5nOiAnMTRweCcgfX0+e3IuZnVsbF9uYW1lfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE0cHgnIH19Pjxjb2RlIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXNlY29uZGFyeSknLCBwYWRkaW5nOiAnM3B4IDhweCcsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMC44MnJlbScgfX0+e3IuYWRtaXNzaW9uX251bWJlcn08L2NvZGU+PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInLCBwYWRkaW5nOiAnMTRweCcgfX0+PHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjMTBiOTgxJywgZm9udFdlaWdodDogJzcwMCcsIGZvbnRTaXplOiAnMXJlbScgfX0+e3IucHJlc2VudF9jb3VudH08L3NwYW4+PC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInLCBwYWRkaW5nOiAnMTRweCcgfX0+PHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjZWY0NDQ0JywgZm9udFdlaWdodDogJzcwMCcsIGZvbnRTaXplOiAnMXJlbScgfX0+e3IuYWJzZW50X2NvdW50fTwvc3Bhbj48L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICcxNHB4JyB9fT48c3BhbiBzdHlsZT17eyBjb2xvcjogJyNmNTllMGInLCBmb250V2VpZ2h0OiAnNzAwJywgZm9udFNpemU6ICcxcmVtJyB9fT57ci5sYXRlX2NvdW50fTwvc3Bhbj48L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICcxNHB4JywgZm9udFdlaWdodDogJzcwMCcgfX0+e3IudG90YWxfZGF5c308L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnLCBwYWRkaW5nOiAnNXB4IDEycHgnLCBib3JkZXJSYWRpdXM6ICcyMHB4JywgZm9udFNpemU6ICcwLjgycmVtJywgZm9udFdlaWdodDogJzcwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiByYXRpbyA+PSA4MCA/ICdyZ2JhKDE2LDE4NSwxMjksMC4xKScgOiByYXRpbyA+PSA1MCA/ICdyZ2JhKDI0NSwxNTgsMTEsMC4xKScgOiAncmdiYSgyMzksNjgsNjgsMC4xKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHJhdGlvID49IDgwID8gJyMxMGI5ODEnIDogcmF0aW8gPj0gNTAgPyAnI2Y1OWUwYicgOiAnI2VmNDQ0NCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3JhdGlvfSVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8Lz5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgICAgIFRBQiA0OiBDTEFTUyBCUk9BRFNIRUVUIE1BVFJJWCAoRk9STSBNQVNURVIpXHJcbiAgICAgICAgICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi99XHJcbiAgICAgIHthY3RpdmVTdWJUYWIgPT09ICdicm9hZHNoZWV0JyAmJiBhc3NpZ25tZW50cy5mb3JtQ2xhc3MgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMCcgfX0+XHJcbiAgICAgICAgICB7LyogUHJlbWl1bSBIZWFkZXIgKi99XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzE1cHgnLCBiYWNrZ3JvdW5kOiAnbGluZWFyLWdyYWRpZW50KDEzNWRlZywgdmFyKC0tcHJpbWFyeSkgMCUsICMxZTNhOGEgMTAwJSknLCBwYWRkaW5nOiAnMjRweCcsIGNvbG9yOiAnd2hpdGUnLCBib3hTaGFkb3c6ICcwIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4xKScsIGJvcmRlclJhZGl1czogJ3ZhcigtLXJhZGl1cy1sZykgdmFyKC0tcmFkaXVzLWxnKSAwIDAnIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzE1cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc0OHB4JywgaGVpZ2h0OiAnNDhweCcsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknLCBiYWNrZHJvcEZpbHRlcjogJ2JsdXIoMTBweCknLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuNCknIH19PlxyXG4gICAgICAgICAgICAgICAgPEZpbGVTcHJlYWRzaGVldCBzaXplPXsyNH0gY29sb3I9XCJ3aGl0ZVwiIC8+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAnMS4yNXJlbScsIGZvbnRXZWlnaHQ6ICc3MDAnIH19PkNsYXNzIFJlc3VsdCDigJQge2Fzc2lnbm1lbnRzLmZvcm1DbGFzcy5uYW1lfTwvaDM+XHJcbiAgICAgICAgICAgICAgICA8cCBzdHlsZT17eyBjb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC44NSknLCBmb250U2l6ZTogJzAuODVyZW0nLCBtYXJnaW46ICc0cHggMCAwIDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICB7c2V0dGluZ3MuYWN0aXZlX3Rlcm19IMK3IHtzZXR0aW5ncy5hY3RpdmVfc2Vzc2lvbn0gwrcgRnVsbCBicm9hZHNoZWV0IG1hdHJpeFxyXG4gICAgICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgey8qIFRoZSBDbGFzc0Jyb2Fkc2hlZXQgY29tcG9uZW50IGJlbG93IHByb3ZpZGVzIGl0cyBvd24gRG93bmxvYWQgUERGIGFuZCBFeHBvcnQgdG8gRXhjZWwgYnV0dG9ucyAqL31cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPENsYXNzQnJvYWRzaGVldFxyXG4gICAgICAgICAgICBkYXRhPXticm9hZHNoZWV0RGF0YX1cclxuICAgICAgICAgICAgY2xhc3NOYW1lPXthc3NpZ25tZW50cy5mb3JtQ2xhc3MubmFtZX1cclxuICAgICAgICAgICAgdGVybT17c2V0dGluZ3MuYWN0aXZlX3Rlcm19XHJcbiAgICAgICAgICAgIHNlc3Npb249e3NldHRpbmdzLmFjdGl2ZV9zZXNzaW9ufVxyXG4gICAgICAgICAgICBzZXR0aW5ncz17c2V0dGluZ3N9XHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgICB7YWN0aXZlU3ViVGFiID09PSAnYnJvYWRzaGVldCcgJiYgIWFzc2lnbm1lbnRzLmZvcm1DbGFzcyAmJiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1wYW5lbFwiIHN0eWxlPXt7IHBhZGRpbmc6ICcyOHB4JywgYmFja2dyb3VuZENvbG9yOiAndmFyKC0tYmctc3VyZmFjZSknIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBwYWRkaW5nOiAnNDBweCcsIGdhcDogJzE2cHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnNjRweCcsIGhlaWdodDogJzY0cHgnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDU5LDEzMCwyNDYsMC4xKScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgICA8RmlsZVNwcmVhZHNoZWV0IHNpemU9ezMyfSBzdHlsZT17eyBjb2xvcjogJ3ZhcigtLXByaW1hcnkpJyB9fSAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogMCwgY29sb3I6ICd2YXIoLS10ZXh0LXByaW1hcnkpJyB9fT5DbGFzcyBSZXN1bHRzPC9oMz5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICd2YXIoLS10ZXh0LW11dGVkKScsIG1heFdpZHRoOiAnNDAwcHgnLCBtYXJnaW46IDAgfX0+WW91IG11c3QgYmUgYXNzaWduZWQgYXMgYSBGb3JtIE1hc3RlciB0byB2aWV3IGNsYXNzIGJyb2Fkc2hlZXRzLjwvcD5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgICAgICAgVEFCIDU6IEJFSEFWSU9SQUwgJiBQU1lDSE9NT1RPUiBHUkFERVMgKEZPUk0gTUFTVEVSKVxyXG4gICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7YWN0aXZlU3ViVGFiID09PSAnYmVoYXZpb3JhbCcgJiYgIWFzc2lnbm1lbnRzLmZvcm1DbGFzcyAmJiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1wYW5lbFwiIHN0eWxlPXt7IHBhZGRpbmc6ICcyOHB4JywgYmFja2dyb3VuZENvbG9yOiAndmFyKC0tYmctc3VyZmFjZSknIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBwYWRkaW5nOiAnNDBweCcsIGdhcDogJzE2cHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnNjRweCcsIGhlaWdodDogJzY0cHgnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI0NSwxNTgsMTEsMC4xKScsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgICA8QXdhcmQgc2l6ZT17MzJ9IHN0eWxlPXt7IGNvbG9yOiAnI2Y1OWUwYicgfX0gLz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46IDAsIGNvbG9yOiAndmFyKC0tdGV4dC1wcmltYXJ5KScgfX0+QmVoYXZpb3JhbCBUcmFpdHM8L2gzPlxyXG4gICAgICAgICAgICA8cCBzdHlsZT17eyBjb2xvcjogJ3ZhcigtLXRleHQtbXV0ZWQpJywgbWF4V2lkdGg6ICc0MDBweCcsIG1hcmdpbjogMCB9fT5Zb3UgbXVzdCBiZSBhc3NpZ25lZCBhcyBhIEZvcm0gTWFzdGVyIHRvIGV2YWx1YXRlIHBzeWNob21vdG9yIHRyYWl0cy48L3A+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuICAgICAge2FjdGl2ZVN1YlRhYiA9PT0gJ2JlaGF2aW9yYWwnICYmIGFzc2lnbm1lbnRzLmZvcm1DbGFzcyAmJiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1wYW5lbFwiIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXN1cmZhY2UpJywgb3ZlcmZsb3c6ICdoaWRkZW4nIH19PlxyXG4gICAgICAgICAgey8qIFByZW1pdW0gSGVhZGVyICovfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICcxNXB4JywgYmFja2dyb3VuZDogJ2xpbmVhci1ncmFkaWVudCgxMzVkZWcsIHZhcigtLXByaW1hcnkpIDAlLCAjMWUzYThhIDEwMCUpJywgcGFkZGluZzogJzI0cHgnLCBjb2xvcjogJ3doaXRlJywgYm94U2hhZG93OiAnMCA0cHggMTVweCByZ2JhKDAsMCwwLDAuMSknIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzE1cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc0OHB4JywgaGVpZ2h0OiAnNDhweCcsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknLCBiYWNrZHJvcEZpbHRlcjogJ2JsdXIoMTBweCknLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuNCknIH19PlxyXG4gICAgICAgICAgICAgICAgPEF3YXJkIHNpemU9ezI0fSBjb2xvcj1cIndoaXRlXCIgLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogMCwgZm9udFNpemU6ICcxLjI1cmVtJywgZm9udFdlaWdodDogJzcwMCcgfX0+QmVoYXZpb3JhbCBUcmFpdHMgJiBQc3ljaG9tb3RvciBSYXRpbmdzPC9oMz5cclxuICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwwLjg1KScsIGZvbnRTaXplOiAnMC44NXJlbScsIG1hcmdpbjogJzRweCAwIDAgMCcgfX0+RXZhbHVhdGUgc3R1ZGVudHMgb24gYSBzY2FsZSBvZiAxIChQb29yKSB0byA1IChFeGNlbGxlbnQpLjwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzI0cHgnIH19PlxyXG4gICAgICAgICAgeyFldmFsdWF0aW5nU3R1ZGVudCA/IChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzIwcHgnLCBmbGV4V3JhcDogJ3dyYXAnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnMjBweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmbGV4OiAnMSAxIDMwMHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBmb250V2VpZ2h0OiAnNzAwJywgbWFyZ2luQm90dG9tOiAnOHB4JywgZGlzcGxheTogJ2Jsb2NrJywgY29sb3I6ICd2YXIoLS10ZXh0LXByaW1hcnkpJywgZm9udFNpemU6ICcwLjlyZW0nIH19PlNlbGVjdCBTdHVkZW50IHRvIEV2YWx1YXRlPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxzZWxlY3QgXHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIFxyXG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdElkID0gcGFyc2VJbnQoZS50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RJZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0ID0gWy4uLmJlaGF2aW9yYWxTdHVkZW50cy51bnJhdGVkLCAuLi5iZWhhdmlvcmFsU3R1ZGVudHMucmF0ZWRdLmZpbmQocyA9PiBzLmlkID09PSBzdElkKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3QpIGhhbmRsZVNlbGVjdFN0dWRlbnRGb3JFdmFsKHN0KTtcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPVwiXCJcclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiIGRpc2FibGVkPi0tIFNlbGVjdCBhIHN0dWRlbnQgLS08L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAge2JlaGF2aW9yYWxTdHVkZW50cy51bnJhdGVkLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgIDxvcHRncm91cCBsYWJlbD1cIk5vdCBFdmFsdWF0ZWQgWWV0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7YmVoYXZpb3JhbFN0dWRlbnRzLnVucmF0ZWQubWFwKHMgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17cy5pZH0gdmFsdWU9e3MuaWR9PntzLmZ1bGxfbmFtZX0gKHtzLmFkbWlzc2lvbl9udW1iZXJ9KTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9vcHRncm91cD5cclxuICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgICAge2JlaGF2aW9yYWxTdHVkZW50cy5yYXRlZC5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICAgICAgICA8b3B0Z3JvdXAgbGFiZWw9XCJBbHJlYWR5IEV2YWx1YXRlZFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAge2JlaGF2aW9yYWxTdHVkZW50cy5yYXRlZC5tYXAocyA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtzLmlkfSB2YWx1ZT17cy5pZH0+e3MuZnVsbF9uYW1lfSAoe3MuYWRtaXNzaW9uX251bWJlcn0pIOKchTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9vcHRncm91cD5cclxuICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICcyMHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxoNCBzdHlsZT17eyBtYXJnaW46IDAgfX0+RXZhbHVhdGluZzogPHNwYW4gc3R5bGU9e3sgY29sb3I6ICd2YXIoLS1wcmltYXJ5KScgfX0+e2V2YWx1YXRpbmdTdHVkZW50LmZ1bGxfbmFtZX08L3NwYW4+PC9oND5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuIGJ0bi1zZWNvbmRhcnlcIiBzdHlsZT17eyBwYWRkaW5nOiAnNHB4IDEycHgnLCBmb250U2l6ZTogJzAuOHJlbScgfX0gb25DbGljaz17KCkgPT4gc2V0RXZhbHVhdGluZ1N0dWRlbnQobnVsbCl9PkNhbmNlbCAvIEJhY2s8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e2hhbmRsZVNhdmVTa2lsbEV2YWx1YXRpb259PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICdyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyODBweCwgMWZyKSknLCBnYXA6ICcyMHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAge3NraWxsc0xpc3QubWFwKHNraWxsID0+IChcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17c2tpbGwuaWR9IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpJywgcGFkZGluZzogJzEycHgnLCBib3JkZXJSYWRpdXM6ICc2cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZjhmYWZjJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBkaXNwbGF5OiAnYmxvY2snLCBmb250V2VpZ2h0OiAnYm9sZCcsIG1hcmdpbkJvdHRvbTogJzEwcHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7c2tpbGwubmFtZX0gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImJhZGdlXCIgc3R5bGU9e3sgZmxvYXQ6ICdyaWdodCcsIGZvbnRTaXplOiAnMC43cmVtJywgYmFja2dyb3VuZENvbG9yOiBza2lsbC5jYXRlZ29yeSA9PT0gJ0FGRkVDVElWRScgPyAnI2UwZjJmZScgOiAnI2ZlZjNjNycsIGNvbG9yOiBza2lsbC5jYXRlZ29yeSA9PT0gJ0FGRkVDVElWRScgPyAnIzA3NTk4NScgOiAnIzkyNDAwZScgfX0+e3NraWxsLmNhdGVnb3J5fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgcGFkZGluZzogJzAgMTBweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtbMSwgMiwgMywgNCwgNV0ubWFwKHJhdGluZyA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGtleT17cmF0aW5nfSBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgY3Vyc29yOiAncG9pbnRlcicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInJhZGlvXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17YHNraWxsXyR7c2tpbGwuaWR9XyR7c2tpbGwuY2F0ZWdvcnl9YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3JhdGluZ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17c2tpbGxSYXRpbmdzW2Ake3NraWxsLmlkfV8ke3NraWxsLmNhdGVnb3J5fWBdID09PSByYXRpbmd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoKSA9PiBzZXRTa2lsbFJhdGluZ3MocHJldiA9PiAoeyAuLi5wcmV2LCBbYCR7c2tpbGwuaWR9XyR7c2tpbGwuY2F0ZWdvcnl9YF06IHJhdGluZyB9KSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcwLjg1cmVtJywgbWFyZ2luVG9wOiAnNnB4JywgZm9udFdlaWdodDogc2tpbGxSYXRpbmdzW2Ake3NraWxsLmlkfV8ke3NraWxsLmNhdGVnb3J5fWBdID09PSByYXRpbmcgPyAnYm9sZCcgOiAnbm9ybWFsJyB9fT57cmF0aW5nfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB7c2tpbGxzTGlzdC5sZW5ndGggPT09IDAgJiYgPHAgc3R5bGU9e3sgY29sb3I6ICd2YXIoLS1kYW5nZXIpJywgbWFyZ2luVG9wOiAnMTBweCcgfX0+Tm8gc2tpbGxzIGNvbmZpZ3VyZWQgYnkgYWRtaW4geWV0LjwvcD59XHJcblxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICcyMHB4JywgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5XCIgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNnB4JyB9fSBkaXNhYmxlZD17c2tpbGxzTGlzdC5sZW5ndGggPT09IDB9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxTYXZlIHNpemU9ezE1fSAvPiBTYXZlIEV2YWx1YXRpb25cclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Zvcm0+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgICAgICAgVEFCIDU6IFRFQUNIRVIgU0NIRU1FIE9GIFdPUktcclxuICAgICAgICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAge2FjdGl2ZVN1YlRhYiA9PT0gJ3NjaGVtZXMnICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzAnIH19PlxyXG4gICAgICAgICAgey8qIFByZW1pdW0gSGVybyBIZWFkZXIgKi99XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGZsZXhXcmFwOiAnd3JhcCcsIGdhcDogJzE1cHgnLCBiYWNrZ3JvdW5kOiAnbGluZWFyLWdyYWRpZW50KDEzNWRlZywgdmFyKC0tcHJpbWFyeSkgMCUsICMxZTNhOGEgMTAwJSknLCBwYWRkaW5nOiAnMjRweCcsIGNvbG9yOiAnd2hpdGUnLCBib3hTaGFkb3c6ICcwIDRweCAxNXB4IHJnYmEoMCwwLDAsMC4xKScsIGJvcmRlclJhZGl1czogJ3ZhcigtLXJhZGl1cy1sZykgdmFyKC0tcmFkaXVzLWxnKSAwIDAnIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzE1cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICc0OHB4JywgaGVpZ2h0OiAnNDhweCcsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC4xNSknLCBiYWNrZHJvcEZpbHRlcjogJ2JsdXIoMTBweCknLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuNCknIH19PlxyXG4gICAgICAgICAgICAgICAgPEJvb2tPcGVuIHNpemU9ezI0fSBjb2xvcj1cIndoaXRlXCIgLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogMCwgZm9udFNpemU6ICcxLjI1cmVtJywgZm9udFdlaWdodDogJzcwMCcgfX0+U2NoZW1lIG9mIFdvcms8L2gzPlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuODUpJywgZm9udFNpemU6ICcwLjg1cmVtJywgbWFyZ2luOiAnNHB4IDAgMCAwJyB9fT5SZXZpZXcgYW5kIHVwZGF0ZSB0aGUgd2Vla2x5IGNvdXJzZSBvdXRsaW5lIGZvciB5b3VyIGFzc2lnbmVkIHN1YmplY3RzLjwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICcxMHB4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICAgICAge3RlYWNoZXJTY2hlbWVBc3NpZ25JZHggIT09ICcnICYmIChcclxuICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIG5vLXByaW50XCJcclxuICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlRG93bmxvYWRTY2hlbWVQREZ9XHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzhweCcsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC4yKScsIGJhY2tkcm9wRmlsdGVyOiAnYmx1cig1cHgpJywgYm9yZGVyOiAnMS41cHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjUpJywgY29sb3I6ICd3aGl0ZScsIHBhZGRpbmc6ICcxMHB4IDIwcHgnLCBib3JkZXJSYWRpdXM6ICcyMHB4JywgZm9udFdlaWdodDogJzcwMCcsIGN1cnNvcjogJ3BvaW50ZXInLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnIH19XHJcbiAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KGUpID0+IGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjMpJ31cclxuICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoZSkgPT4gZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMiknfVxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8RG93bmxvYWQgc2l6ZT17MTV9IC8+IERvd25sb2FkIFBERlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogRmlsdGVyIEJhciAqL31cclxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtcGFuZWxcIiBzdHlsZT17eyBwYWRkaW5nOiAnMjBweCcsIGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXN1cmZhY2UpJywgYm9yZGVyUmFkaXVzOiAnMCcsIGJvcmRlclRvcDogJ25vbmUnIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnMTJweCcsIGZsZXhXcmFwOiAnd3JhcCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCIgc3R5bGU9e3sgbWFyZ2luOiAwLCBmbGV4OiAnMSAxIDIwMHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBmb250U2l6ZTogJzAuOHJlbScsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJ3ZhcigtLXRleHQtc2Vjb25kYXJ5KScsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBsZXR0ZXJTcGFjaW5nOiAnMC4wNGVtJyB9fT5TZWxlY3QgU3ViamVjdDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8c2VsZWN0XHJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiXHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXt0ZWFjaGVyU2NoZW1lQXNzaWduSWR4fVxyXG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRlYWNoZXJTY2hlbWVBc3NpZ25JZHgoZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+Q2hvb3NlIGFzc2lnbmVkIHN1YmplY3QuLi48L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAge2Fzc2lnbm1lbnRzLnN1YmplY3RzLm1hcCgoYXNzaWduLCBpZHgpID0+IChcclxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17aWR4fSB2YWx1ZT17aWR4fT57YXNzaWduLnN1YmplY3RfbmFtZX0gLSB7YXNzaWduLmNsYXNzX25hbWV9PC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCIgc3R5bGU9e3sgbWFyZ2luOiAwLCBmbGV4OiAnMSAxIDE1MHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBmb250U2l6ZTogJzAuOHJlbScsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJ3ZhcigtLXRleHQtc2Vjb25kYXJ5KScsIHRleHRUcmFuc2Zvcm06ICd1cHBlcmNhc2UnLCBsZXR0ZXJTcGFjaW5nOiAnMC4wNGVtJyB9fT5UZXJtPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxzZWxlY3RcclxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCJcclxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RlYWNoZXJTY2hlbWVUZXJtfVxyXG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFRlYWNoZXJTY2hlbWVUZXJtKGUudGFyZ2V0LnZhbHVlKX1cclxuICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjFzdCBUZXJtXCI+MXN0IFRlcm08L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjJuZCBUZXJtXCI+Mm5kIFRlcm08L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjNyZCBUZXJtXCI+M3JkIFRlcm08L29wdGlvbj5cclxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIHsvKiBTY2hlbWUgVGFibGUgKi99XHJcbiAgICAgICAgICB7dGVhY2hlclNjaGVtZUFzc2lnbklkeCA9PT0gJycgPyAoXHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtcGFuZWxcIiBzdHlsZT17eyBwYWRkaW5nOiAnNDBweCcsIGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXN1cmZhY2UpJywgdGV4dEFsaWduOiAnY2VudGVyJywgYm9yZGVyUmFkaXVzOiAnMCAwIHZhcigtLXJhZGl1cy1sZykgdmFyKC0tcmFkaXVzLWxnKScgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzY0cHgnLCBoZWlnaHQ6ICc2NHB4JywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZENvbG9yOiAncmdiYSg5OSwxMDIsMjQxLDAuMSknLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIG1hcmdpbjogJzAgYXV0byAxNnB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxCb29rT3BlbiBzaXplPXszMn0gc3R5bGU9e3sgY29sb3I6ICcjNjM2NmYxJyB9fSAvPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tdGV4dC1tdXRlZCknLCBmb250U2l6ZTogJzAuOTVyZW0nLCBtYXJnaW46IDAgfX0+U2VsZWN0IGEgc3ViamVjdCBhYm92ZSB0byBsb2FkIHRoZSBzY2hlbWUgb2Ygd29yay48L3A+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgPGRpdiByZWY9e3NjaGVtZVJlcG9ydFJlZn0gY2xhc3NOYW1lPVwiZ2xhc3MtcGFuZWxcIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCBib3JkZXJSYWRpdXM6ICcwIDAgdmFyKC0tcmFkaXVzLWxnKSB2YXIoLS1yYWRpdXMtbGcpJywgYm9yZGVyVG9wOiAnbm9uZScsIHBhZGRpbmc6ICcxMHB4JyB9fT5cclxuICAgICAgICAgICAgICB7LyogU3ViamVjdCBJbmZvIFN1Yi1IZWFkZXIgKi99XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzE2cHggMjRweCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKScsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsXHJcbiAgICAgICAgICAgICAgICBmbGV4V3JhcDogJ3dyYXAnLFxyXG4gICAgICAgICAgICAgICAgZ2FwOiAnOHB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDU5LDEzMCwyNDYsMC4wNikgMCUsIHJnYmEoMzAsNTgsMTM4LDAuMDQpIDEwMCUpJ1xyXG4gICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMzZweCcsIGhlaWdodDogJzM2cHgnLCBib3JkZXJSYWRpdXM6ICc1MCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLXByaW1hcnkpJywgY29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxCb29rT3BlbiBzaXplPXsxOH0gLz5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiAnNzAwJywgZm9udFNpemU6ICcwLjk1cmVtJywgY29sb3I6ICd2YXIoLS1wcmltYXJ5KScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7YXNzaWdubWVudHMuc3ViamVjdHNbdGVhY2hlclNjaGVtZUFzc2lnbklkeF0/LnN1YmplY3RfbmFtZSB8fCAnU3ViamVjdCd9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzAuNzhyZW0nLCBjb2xvcjogJ3ZhcigtLXRleHQtc2Vjb25kYXJ5KScgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7YXNzaWdubWVudHMuc3ViamVjdHNbdGVhY2hlclNjaGVtZUFzc2lnbklkeF0/LmNsYXNzX25hbWUgfHwgJ0NsYXNzJ30gwrcge3RlYWNoZXJTY2hlbWVUZXJtfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgcGFkZGluZzogJzRweCAxMnB4JywgYm9yZGVyUmFkaXVzOiAnMjBweCcsIGZvbnRTaXplOiAnMC43OHJlbScsIGZvbnRXZWlnaHQ6ICc2MDAnLCBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1zdWNjZXNzLWxpZ2h0KScsIGNvbG9yOiAndmFyKC0tc3VjY2VzcyknIH19PlxyXG4gICAgICAgICAgICAgICAgICB7dGVhY2hlclNjaGVtZVdlZWtzLmZpbHRlcih3ID0+IHcudG9waWMpLmxlbmd0aH0gLyAxMiBXZWVrcyBGaWxsZWRcclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgey8qIFRhYmxlICovfVxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGFibGUtY29udGFpbmVyXCIgc3R5bGU9e3sgbWFyZ2luOiAwLCBib3JkZXJSYWRpdXM6IDAgfX0+XHJcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwic2Nob29sLXRhYmxlXCIgc3R5bGU9e3sgbWFyZ2luOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHdpZHRoOiAnNzBweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+V2VlazwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgd2lkdGg6ICczOCUnIH19PlRpdGxlICYgU3VidGl0bGU8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoPkNvbnRlbnQgLyBPYmplY3RpdmVzPC90aD5cclxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAge3RlYWNoZXJTY2hlbWVXZWVrcy5tYXAoKHcsIGlkeCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aWR4fSBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IHcudG9waWMgPyAndHJhbnNwYXJlbnQnIDogJ3JnYmEoMjU1LDU5LDQ4LDAuMDMpJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHZlcnRpY2FsQWxpZ246ICd0b3AnLCBwYWRkaW5nVG9wOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzMycHgnLCBoZWlnaHQ6ICczMnB4JywgYm9yZGVyUmFkaXVzOiAnNTAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdy50b3BpYyA/ICd2YXIoLS1wcmltYXJ5KScgOiAndmFyKC0tYm9yZGVyLWNvbG9yKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogdy50b3BpYyA/ICcjZmZmJyA6ICd2YXIoLS10ZXh0LW11dGVkKScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnNzAwJywgZm9udFNpemU6ICcwLjhyZW0nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX0+e3cud2Vla308L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTJweCAxNHB4JywgdmVydGljYWxBbGlnbjogJ3RvcCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAge3cudG9waWMgPyAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6ICc3MDAnLCBmb250U2l6ZTogJzAuOTJyZW0nLCBjb2xvcjogJ3ZhcigtLXRleHQtcHJpbWFyeSknIH19Pnt3LnRvcGljfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dy5zdWJ0aXRsZSAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzAuOHJlbScsIGNvbG9yOiAndmFyKC0tcHJpbWFyeSknLCBtYXJnaW5Ub3A6ICczcHgnLCBmb250V2VpZ2h0OiAnNTAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIPCfk4wge3cuc3VidGl0bGV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICd2YXIoLS10ZXh0LW11dGVkKScgfX0+Tm90IHNwZWNpZmllZDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzEycHggMTRweCcsIGZvbnRTaXplOiAnMC44OHJlbScsIHZlcnRpY2FsQWxpZ246ICd0b3AnLCB3aGl0ZVNwYWNlOiAncHJlLWxpbmUnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt3Lm9iamVjdGl2ZXMgfHwgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICd2YXIoLS10ZXh0LW11dGVkKScgfX0+Tm90IHNwZWNpZmllZDwvc3Bhbj59XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgICAgICBNWSBTVFVERU5UUyBUQUIgKEZPUk0gTUFTVEVSKVxyXG4gICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7YWN0aXZlU3ViVGFiID09PSAnc3R1ZGVudHMnICYmICFhc3NpZ25tZW50cy5mb3JtQ2xhc3MgJiYgKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtcGFuZWxcIiBzdHlsZT17eyBwYWRkaW5nOiAnMjhweCcsIGJhY2tncm91bmRDb2xvcjogJ3ZhcigtLWJnLXN1cmZhY2UpJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgcGFkZGluZzogJzQwcHgnLCBnYXA6ICcxNnB4JywgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzY0cHgnLCBoZWlnaHQ6ICc2NHB4JywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZENvbG9yOiAncmdiYSg1OSwxMzAsMjQ2LDAuMSknLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICAgICAgPFVzZXJzIHNpemU9ezMyfSBzdHlsZT17eyBjb2xvcjogJ3ZhcigtLXByaW1hcnkpJyB9fSAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGgzIHN0eWxlPXt7IG1hcmdpbjogMCB9fT5NeSBTdHVkZW50czwvaDM+XHJcbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tdGV4dC1tdXRlZCknLCBtYXhXaWR0aDogJzQwMHB4JywgbWFyZ2luOiAwIH19PllvdSBtdXN0IGJlIGFzc2lnbmVkIGFzIGEgRm9ybSBNYXN0ZXIgdG8gdmlldyB5b3VyIGNsYXNzIHN0dWRlbnRzLjwvcD5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAge2FjdGl2ZVN1YlRhYiA9PT0gJ3N0dWRlbnRzJyAmJiBhc3NpZ25tZW50cy5mb3JtQ2xhc3MgJiYgKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtcGFuZWxcIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zdXJmYWNlKScsIG92ZXJmbG93OiAnaGlkZGVuJyB9fT5cclxuICAgICAgICAgIHsvKiBQcmVtaXVtIEhlYWRlciAqL31cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZmxleFdyYXA6ICd3cmFwJywgZ2FwOiAnMTVweCcsIGJhY2tncm91bmQ6ICdsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCB2YXIoLS1wcmltYXJ5KSAwJSwgIzFlM2E4YSAxMDAlKScsIHBhZGRpbmc6ICcyNHB4JywgY29sb3I6ICd3aGl0ZScsIGJveFNoYWRvdzogJzAgNHB4IDE1cHggcmdiYSgwLDAsMCwwLjEpJyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICcxNXB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnNDhweCcsIGhlaWdodDogJzQ4cHgnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMTUpJywgYmFja2Ryb3BGaWx0ZXI6ICdibHVyKDEwcHgpJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBib3JkZXI6ICcycHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjQpJyB9fT5cclxuICAgICAgICAgICAgICAgIDxVc2VycyBzaXplPXsyNH0gY29sb3I9XCJ3aGl0ZVwiIC8+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxoMyBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAnMS4yNXJlbScsIGZvbnRXZWlnaHQ6ICc3MDAnIH19Pk15IFN0dWRlbnRzIOKAlCB7YXNzaWdubWVudHMuZm9ybUNsYXNzLm5hbWV9PC9oMz5cclxuICAgICAgICAgICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwwLjg1KScsIGZvbnRTaXplOiAnMC44NXJlbScsIG1hcmdpbjogJzRweCAwIDAgMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHtmb3JtQ2xhc3NTdHVkZW50cy5sZW5ndGh9IHN0dWRlbnR7Zm9ybUNsYXNzU3R1ZGVudHMubGVuZ3RoICE9PSAxID8gJ3MnIDogJyd9IGVucm9sbGVkIGluIHlvdXIgY2xhc3NcclxuICAgICAgICAgICAgICAgIDwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIHsvKiBSZWdpc3RlciBCdXR0b24g4oCUIG9ubHkgaWYgYWRtaW4gcGVybWl0cyAqL31cclxuICAgICAgICAgICAge3NldHRpbmdzLmFsbG93X2ZtX3JlZ2lzdGVyX3N0dWRlbnQgPT09IDEgPyAoXHJcbiAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuXCJcclxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dTdHVkZW50TW9kYWwodHJ1ZSl9XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMiknLCBiYWNrZHJvcEZpbHRlcjogJ2JsdXIoNXB4KScsIGJvcmRlcjogJzEuNXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC41KScsIGNvbG9yOiAnd2hpdGUnLCBwYWRkaW5nOiAnMTBweCAyMHB4JywgYm9yZGVyUmFkaXVzOiAnMjBweCcsIGZvbnRXZWlnaHQ6ICc3MDAnLCBjdXJzb3I6ICdwb2ludGVyJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJyB9fVxyXG4gICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoZSkgPT4gZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMyknfVxyXG4gICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoZSkgPT4gZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZ2JhKDI1NSwyNTUsMjU1LDAuMiknfVxyXG4gICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgIDxQbHVzIHNpemU9ezE2fSAvPiBSZWdpc3RlciBOZXcgU3R1ZGVudFxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICApIDogKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNnB4JywgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLDAsMCwwLjE1KScsIGJvcmRlclJhZGl1czogJzIwcHgnLCBwYWRkaW5nOiAnOHB4IDE2cHgnLCBmb250U2l6ZTogJzAuODJyZW0nLCBjb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC42KScsIGJvcmRlcjogJzFweCBkYXNoZWQgcmdiYSgyNTUsMjU1LDI1NSwwLjMpJyB9fT5cclxuICAgICAgICAgICAgICAgIDxMb2NrIHNpemU9ezE0fSAvPiBSZWdpc3RyYXRpb24gZGlzYWJsZWQgYnkgYWRtaW5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzI0cHgnIH19PlxyXG4gICAgICAgICAgICB7LyogU2VhcmNoIGJhciAqL31cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICcyMHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCBtYXhXaWR0aDogJzM2MHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxTZWFyY2ggc2l6ZT17MTZ9IHN0eWxlPXt7IHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBsZWZ0OiAnMTJweCcsIHRvcDogJzUwJScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTUwJSknLCBjb2xvcjogJ3ZhcigtLXRleHQtbXV0ZWQpJyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCJcclxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggYnkgbmFtZSBvciBhZG1pc3Npb24gbnVtYmVyLi4uXCJcclxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3N0dWRlbnRTZWFyY2h9XHJcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0U3R1ZGVudFNlYXJjaChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiAnMzZweCcgfX1cclxuICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgey8qIFN0dWRlbnQgTGlzdCAqL31cclxuICAgICAgICAgICAge3N0dWRlbnRzTG9hZGluZyA/IChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6ICc0MHB4JywgY29sb3I6ICd2YXIoLS10ZXh0LW11dGVkKScgfX0+TG9hZGluZyBzdHVkZW50c+KApjwvZGl2PlxyXG4gICAgICAgICAgICApIDogZm9ybUNsYXNzU3R1ZGVudHMubGVuZ3RoID09PSAwID8gKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogJzQwcHgnLCBjb2xvcjogJ3ZhcigtLXRleHQtbXV0ZWQpJyB9fT5cclxuICAgICAgICAgICAgICAgIDxVc2VycyBzaXplPXs0MH0gc3R5bGU9e3sgb3BhY2l0eTogMC4zLCBtYXJnaW5Cb3R0b206ICcxMnB4JyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgPHAgc3R5bGU9e3sgbWFyZ2luOiAwIH19Pk5vIHN0dWRlbnRzIGVucm9sbGVkIGluIHthc3NpZ25tZW50cy5mb3JtQ2xhc3MubmFtZX0geWV0LjwvcD5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG92ZXJmbG93WDogJ2F1dG8nLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciknIH19PlxyXG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInNjaG9vbC10YWJsZVwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPHRoZWFkIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogJyNmOGZhZmMnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+IzwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgcGFkZGluZzogJzE0cHgnIH19PlN0dWRlbnQgTmFtZTwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgcGFkZGluZzogJzE0cHgnIH19PkFkbWlzc2lvbiBOby48L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHBhZGRpbmc6ICcxNHB4JyB9fT5HZW5kZXI8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHBhZGRpbmc6ICcxNHB4JyB9fT5EYXRlIG9mIEJpcnRoPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+QWN0aW9uczwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIHtmb3JtQ2xhc3NTdHVkZW50c1xyXG4gICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihzID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMuZnVsbF9uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoc3R1ZGVudFNlYXJjaC50b0xvd2VyQ2FzZSgpKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAocy5hZG1pc3Npb25fbnVtYmVyIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHN0dWRlbnRTZWFyY2gudG9Mb3dlckNhc2UoKSlcclxuICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKHMsIGlkeCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgPHRyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17cy5pZH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgdHJhbnNpdGlvbjogJ2JhY2tncm91bmQtY29sb3IgMC4ycycsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpJyB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eyhlKSA9PiBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYmEoMCwwLDAsMC4wMSknfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eyhlKSA9PiBlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J31cclxuICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNHB4JywgY29sb3I6ICd2YXIoLS10ZXh0LW11dGVkKScsIGZvbnRXZWlnaHQ6ICc2MDAnIH19PntpZHggKyAxfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICcxMnB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICczOHB4JywgaGVpZ2h0OiAnMzhweCcsIGJvcmRlclJhZGl1czogJzUwJScsIG92ZXJmbG93OiAnaGlkZGVuJywgZmxleFNocmluazogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndmFyKC0tYmctc2Vjb25kYXJ5KScsIGJvcmRlcjogJzJweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3MucGFzc3BvcnRfcGhvdG9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IDxpbWcgc3JjPXtzLnBhc3Nwb3J0X3Bob3RvfSBhbHQ9e3MuZnVsbF9uYW1lfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJywgb2JqZWN0Rml0OiAnY292ZXInIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiA8VXNlcnMgc2l6ZT17MTh9IHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tdGV4dC1tdXRlZCknIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAndmFyKC0tdGV4dC1wcmltYXJ5KScgfX0+e3MuZnVsbF9uYW1lfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29kZSBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zZWNvbmRhcnkpJywgcGFkZGluZzogJzNweCA4cHgnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzAuODJyZW0nIH19PntzLmFkbWlzc2lvbl9udW1iZXIgfHwgJ+KAlCd9PC9jb2RlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDEwcHgnLCBib3JkZXJSYWRpdXM6ICcyMHB4JywgZm9udFNpemU6ICcwLjc4cmVtJywgZm9udFdlaWdodDogJzYwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHMuc2V4ID09PSAnRmVtYWxlJyA/ICdyZ2JhKDIzNiw3MiwxNTMsMC4xKScgOiAncmdiYSg1OSwxMzAsMjQ2LDAuMSknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHMuc2V4ID09PSAnRmVtYWxlJyA/ICcjZGIyNzc3JyA6ICcjMjU2M2ViJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19PntzLnNleCB8fCAn4oCUJ308L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcsIGNvbG9yOiAndmFyKC0tdGV4dC1zZWNvbmRhcnkpJyB9fT57cy5kYXRlX29mX2JpcnRoIHx8ICfigJQnfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMTRweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzhweCcsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld2luZ1N0dWRlbnQocyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiVmlldyBQcm9maWxlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogJzZweCAxMnB4JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciknLCBiYWNrZ3JvdW5kQ29sb3I6ICd2YXIoLS1iZy1zZWNvbmRhcnkpJywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzVweCcsIGZvbnRTaXplOiAnMC44cmVtJywgZm9udFdlaWdodDogJzYwMCcsIGNvbG9yOiAndmFyKC0tdGV4dC1zZWNvbmRhcnkpJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJyB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RXllIHNpemU9ezE0fSAvPiBWaWV3XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzZXR0aW5ncy5hbGxvd19mbV9lZGl0X3N0dWRlbnQgPT09IDEgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld2luZ1N0dWRlbnQocyl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCJFZGl0IFN0dWRlbnRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6ICc2cHggMTJweCcsIGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDU5LDEzMCwyNDYsMC4zKScsIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoNTksMTMwLDI0NiwwLjA4KScsIGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc1cHgnLCBmb250U2l6ZTogJzAuOHJlbScsIGZvbnRXZWlnaHQ6ICc2MDAnLCBjb2xvcjogJyMyNTYzZWInLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RWRpdDMgc2l6ZT17MTR9IC8+IEVkaXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgICAgICAgIE1ZIFNUVURFTlRTIOKAlCBSRUdJU1RFUiBNT0RBTFxyXG4gICAgICAgICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7c2hvd1N0dWRlbnRNb2RhbCAmJiBhc3NpZ25tZW50cy5mb3JtQ2xhc3MgJiYgKFxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibW9kYWwtb3ZlcmxheVwiPlxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtb2RhbC1jb250ZW50IGdsYXNzLXBhbmVsXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAndmFyKC0tYmctc3VyZmFjZSknLCBtYXhXaWR0aDogJzU0MHB4Jywgd2lkdGg6ICc5NSUnIH19PlxyXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIm1vZGFsLWNsb3NlXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd1N0dWRlbnRNb2RhbChmYWxzZSl9PuKclTwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8aDMgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JywgbWFyZ2luQm90dG9tOiAnNnB4JyB9fT5cclxuICAgICAgICAgICAgICA8UGx1cyBzaXplPXsyMH0gc3R5bGU9e3sgY29sb3I6ICd2YXIoLS1wcmltYXJ5KScgfX0gLz4gUmVnaXN0ZXIgTmV3IFN0dWRlbnRcclxuICAgICAgICAgICAgPC9oMz5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgY29sb3I6ICd2YXIoLS10ZXh0LXNlY29uZGFyeSknLCBmb250U2l6ZTogJzAuODVyZW0nLCBtYXJnaW5Cb3R0b206ICcyMHB4JyB9fT5cclxuICAgICAgICAgICAgICBSZWdpc3RlcmluZyBpbnRvOiA8c3Ryb25nIHN0eWxlPXt7IGNvbG9yOiAndmFyKC0tcHJpbWFyeSknIH19Pnthc3NpZ25tZW50cy5mb3JtQ2xhc3MubmFtZX08L3N0cm9uZz5cclxuICAgICAgICAgICAgPC9wPlxyXG4gICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17aGFuZGxlUmVnaXN0ZXJTdHVkZW50fSBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmciAxZnIgMWZyJywgZ2FwOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIiBzdHlsZT17eyBtYXJnaW46IDAgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxsYWJlbD5TdXJuYW1lICo8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiByZXF1aXJlZCB2YWx1ZT17c3R1ZGVudEZvcm0uc3VybmFtZX0gb25DaGFuZ2U9eyhlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3U3VybmFtZSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXB1dGVkRnVsbG5hbWUgPSBgJHtuZXdTdXJuYW1lfSAke3N0dWRlbnRGb3JtLmZpcnN0X25hbWV9ICR7c3R1ZGVudEZvcm0ub3RoZXJfbmFtZXN9YC5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFN0dWRlbnRGb3JtKHsgLi4uc3R1ZGVudEZvcm0sIHN1cm5hbWU6IG5ld1N1cm5hbWUsIGZ1bGxfbmFtZTogY29tcHV0ZWRGdWxsbmFtZSB9KTtcclxuICAgICAgICAgICAgICAgICAgfX0gLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCIgc3R5bGU9e3sgbWFyZ2luOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgICA8bGFiZWw+Rmlyc3QgTmFtZSAqPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgcmVxdWlyZWQgdmFsdWU9e3N0dWRlbnRGb3JtLmZpcnN0X25hbWV9IG9uQ2hhbmdlPXsoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0ZpcnN0bmFtZSA9IGUudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXB1dGVkRnVsbG5hbWUgPSBgJHtzdHVkZW50Rm9ybS5zdXJuYW1lfSAke25ld0ZpcnN0bmFtZX0gJHtzdHVkZW50Rm9ybS5vdGhlcl9uYW1lc31gLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U3R1ZGVudEZvcm0oeyAuLi5zdHVkZW50Rm9ybSwgZmlyc3RfbmFtZTogbmV3Rmlyc3RuYW1lLCBmdWxsX25hbWU6IGNvbXB1dGVkRnVsbG5hbWUgfSk7XHJcbiAgICAgICAgICAgICAgICAgIH19IC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiIHN0eWxlPXt7IG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPGxhYmVsPk90aGVyIE5hbWVzPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgdmFsdWU9e3N0dWRlbnRGb3JtLm90aGVyX25hbWVzfSBvbkNoYW5nZT17KGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdPdGhlcm5hbWVzID0gZS50YXJnZXQudmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcHV0ZWRGdWxsbmFtZSA9IGAke3N0dWRlbnRGb3JtLnN1cm5hbWV9ICR7c3R1ZGVudEZvcm0uZmlyc3RfbmFtZX0gJHtuZXdPdGhlcm5hbWVzfWAucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKTtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTdHVkZW50Rm9ybSh7IC4uLnN0dWRlbnRGb3JtLCBvdGhlcl9uYW1lczogbmV3T3RoZXJuYW1lcywgZnVsbF9uYW1lOiBjb21wdXRlZEZ1bGxuYW1lIH0pO1xyXG4gICAgICAgICAgICAgICAgICB9fSAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZ3JpZCcsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6ICcxZnInLCBnYXA6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiIHN0eWxlPXt7IG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPGxhYmVsPkRpc3BsYXkgRnVsbCBOYW1lPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgcmVxdWlyZWQgcmVhZE9ubHkgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiAndmFyKC0tYmctc2Vjb25kYXJ5KScgfX0gdmFsdWU9e3N0dWRlbnRGb3JtLmZ1bGxfbmFtZX0gLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2dyaWQnLCBncmlkVGVtcGxhdGVDb2x1bW5zOiAnMWZyJywgZ2FwOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIiBzdHlsZT17eyBtYXJnaW46IDAgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxsYWJlbD5EYXRlIG9mIEJpcnRoPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJkYXRlXCIgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgdmFsdWU9e3N0dWRlbnRGb3JtLmRhdGVfb2ZfYmlydGh9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0U3R1ZGVudEZvcm0oeyAuLi5zdHVkZW50Rm9ybSwgZGF0ZV9vZl9iaXJ0aDogZS50YXJnZXQudmFsdWUgfSl9IC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdncmlkJywgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzFmciAxZnInLCBnYXA6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiIHN0eWxlPXt7IG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPGxhYmVsPkdlbmRlcjwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgdmFsdWU9e3N0dWRlbnRGb3JtLnNleH0gb25DaGFuZ2U9eyhlKSA9PiBzZXRTdHVkZW50Rm9ybSh7IC4uLnN0dWRlbnRGb3JtLCBzZXg6IGUudGFyZ2V0LnZhbHVlIH0pfT5cclxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPk1hbGU8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPkZlbWFsZTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCIgc3R5bGU9e3sgbWFyZ2luOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgICA8bGFiZWw+UmVsaWdpb248L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIHZhbHVlPXtzdHVkZW50Rm9ybS5yZWxpZ2lvbn0gb25DaGFuZ2U9eyhlKSA9PiBzZXRTdHVkZW50Rm9ybSh7IC4uLnN0dWRlbnRGb3JtLCByZWxpZ2lvbjogZS50YXJnZXQudmFsdWUgfSl9PlxyXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24+SXNsYW08L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPkNocmlzdGlhbml0eTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24+T3RoZXJzPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCIgc3R5bGU9e3sgbWFyZ2luOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsPkhvbWUgQWRkcmVzczwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiB2YWx1ZT17c3R1ZGVudEZvcm0uYWRkcmVzc19yZXNpZGVuY2V9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0U3R1ZGVudEZvcm0oeyAuLi5zdHVkZW50Rm9ybSwgYWRkcmVzc19yZXNpZGVuY2U6IGUudGFyZ2V0LnZhbHVlIH0pfSAvPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiIHN0eWxlPXt7IG1hcmdpbjogMCB9fT5cclxuICAgICAgICAgICAgICAgIDxsYWJlbD5MYXN0IFNjaG9vbCBBdHRlbmRlZDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiB2YWx1ZT17c3R1ZGVudEZvcm0ubGFzdF9zY2hvb2xfYXR0ZW5kZWR9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0U3R1ZGVudEZvcm0oeyAuLi5zdHVkZW50Rm9ybSwgbGFzdF9zY2hvb2xfYXR0ZW5kZWQ6IGUudGFyZ2V0LnZhbHVlIH0pfSAvPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJywgZ2FwOiAnMTBweCcsIG1hcmdpblRvcDogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJidG4gYnRuLXNlY29uZGFyeVwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dTdHVkZW50TW9kYWwoZmFsc2UpfT5DYW5jZWw8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcgfX0+PFNhdmUgc2l6ZT17MTV9IC8+IFJlZ2lzdGVyIFN0dWRlbnQ8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9mb3JtPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAgICAgICBNWSBTVFVERU5UUyDigJQgUFJPRklMRSBWSUVXRVIgTU9EQUxcclxuICAgICAgICAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAge3ZpZXdpbmdTdHVkZW50ICYmIChcclxuICAgICAgICA8U3R1ZGVudFJlZ2lzdHJhdGlvbkZvcm1cclxuICAgICAgICAgIHN0dWRlbnQ9e3ZpZXdpbmdTdHVkZW50fVxyXG4gICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0Vmlld2luZ1N0dWRlbnQobnVsbCl9XHJcbiAgICAgICAgICBvblVwZGF0ZT17KCkgPT4ge1xyXG4gICAgICAgICAgICBzZXRWaWV3aW5nU3R1ZGVudChudWxsKTtcclxuICAgICAgICAgICAgbG9hZEZvcm1DbGFzc1N0dWRlbnRzKGFzc2lnbm1lbnRzLmZvcm1DbGFzcy5pZCk7XHJcbiAgICAgICAgICB9fVxyXG4gICAgICAgIC8+XHJcbiAgICAgICl9XHJcblxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufVxyXG4iXX0=
