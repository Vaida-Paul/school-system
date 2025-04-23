using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using schoolproject.Data;
using schoolproject.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace schoolproject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AttendanceController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

      
        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<AttendanceResponseDto>> AddAttendance(AttendanceCreateDto attendanceDto)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

     
            var student = await _userManager.FindByIdAsync(attendanceDto.StudentId);
            if (student == null)
            {
                return NotFound("Student not found");
            }


            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == attendanceDto.CourseId && c.TeacherId == teacherId);
            if (course == null)
            {
                return NotFound("Course not found or you don't have permission to record attendance for this course");
            }

           
            var enrollment = await _context.StudentCourses
                .FirstOrDefaultAsync(sc => sc.CourseId == attendanceDto.CourseId && sc.StudentId == attendanceDto.StudentId);
            if (enrollment == null)
            {
                return BadRequest("Student is not enrolled in this course");
            }

            
            var existingAttendance = await _context.Attendances
                .FirstOrDefaultAsync(a =>
                    a.CourseId == attendanceDto.CourseId &&
                    a.StudentId == attendanceDto.StudentId &&
                    a.AttendanceDate.Date == attendanceDto.AttendanceDate.Date);

            if (existingAttendance != null)
            {
                return BadRequest("Attendance record already exists for this student on this date for this course");
            }

            var attendance = new Attendance
            {
                IsPresent = attendanceDto.IsPresent,
                ExtraPoints = attendanceDto.ExtraPoints,
                Comment = attendanceDto.Comment,
                AttendanceDate = attendanceDto.AttendanceDate.Date, 
                CourseId = attendanceDto.CourseId,
                StudentId = attendanceDto.StudentId,
                TeacherId = teacherId,
                CreatedDate = DateTime.UtcNow
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            var teacher = await _userManager.FindByIdAsync(teacherId);

            var responseDto = new AttendanceResponseDto
            {
                Id = attendance.Id,
                IsPresent = attendance.IsPresent,
                ExtraPoints = attendance.ExtraPoints,
                Comment = attendance.Comment,
                AttendanceDate = attendance.AttendanceDate,
                CreatedDate = attendance.CreatedDate,
                CourseId = attendance.CourseId,
                CourseName = course.Title,
                StudentName = $"{student.FirstName} {student.LastName}",
                TeacherName = $"{teacher.FirstName} {teacher.LastName}"
            };

            return CreatedAtAction(nameof(GetAttendanceById), new { id = attendance.Id }, responseDto);
        }

    
        [HttpPost("batch")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<AttendanceResponseDto>>> AddBatchAttendance(List<AttendanceCreateDto> attendanceDtos)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (attendanceDtos == null || !attendanceDtos.Any())
            {
                return BadRequest("No attendance records provided");
            }

        
            var courseIds = attendanceDtos.Select(a => a.CourseId).Distinct().ToList();

          
            var teacherCourses = await _context.Courses
                .Where(c => courseIds.Contains(c.Id) && c.TeacherId == teacherId)
                .Select(c => c.Id)
                .ToListAsync();

            if (teacherCourses.Count != courseIds.Count)
            {
                return NotFound("One or more courses not found or you don't have permission to record attendance for these courses");
            }

            var results = new List<AttendanceResponseDto>();
            var attendancesToAdd = new List<Attendance>();

            foreach (var attendanceDto in attendanceDtos)
            {
                
                var student = await _userManager.FindByIdAsync(attendanceDto.StudentId);
                if (student == null)
                {
                    continue; 
                }

     
                var enrollment = await _context.StudentCourses
                    .FirstOrDefaultAsync(sc => sc.CourseId == attendanceDto.CourseId && sc.StudentId == attendanceDto.StudentId);
                if (enrollment == null)
                {
                    continue; 
                }

         
                var existingAttendance = await _context.Attendances
                    .FirstOrDefaultAsync(a =>
                        a.CourseId == attendanceDto.CourseId &&
                        a.StudentId == attendanceDto.StudentId &&
                        a.AttendanceDate.Date == attendanceDto.AttendanceDate.Date);

                if (existingAttendance != null)
                {
                    continue; 
                }

                var attendance = new Attendance
                {
                    IsPresent = attendanceDto.IsPresent,
                    ExtraPoints = attendanceDto.ExtraPoints,
                    Comment = attendanceDto.Comment,
                    AttendanceDate = attendanceDto.AttendanceDate.Date, 
                    CourseId = attendanceDto.CourseId,
                    StudentId = attendanceDto.StudentId,
                    TeacherId = teacherId,
                    CreatedDate = DateTime.UtcNow
                };

                attendancesToAdd.Add(attendance);
            }

            if (!attendancesToAdd.Any())
            {
                return BadRequest("No valid attendance records to add");
            }

            _context.Attendances.AddRange(attendancesToAdd);
            await _context.SaveChangesAsync();

     
            var teacher = await _userManager.FindByIdAsync(teacherId);


            foreach (var attendance in attendancesToAdd)
            {
                var course = await _context.Courses.FindAsync(attendance.CourseId);
                var student = await _userManager.FindByIdAsync(attendance.StudentId);

                results.Add(new AttendanceResponseDto
                {
                    Id = attendance.Id,
                    IsPresent = attendance.IsPresent,
                    ExtraPoints = attendance.ExtraPoints,
                    Comment = attendance.Comment,
                    AttendanceDate = attendance.AttendanceDate,
                    CreatedDate = attendance.CreatedDate,
                    CourseId = attendance.CourseId,
                    CourseName = course.Title,
                    StudentName = $"{student.FirstName} {student.LastName}",
                    TeacherName = $"{teacher.FirstName} {teacher.LastName}"
                });
            }

            return Ok(results);
        }

       
        [HttpGet("{id}")]
        public async Task<ActionResult<AttendanceResponseDto>> GetAttendanceById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

          
            var attendanceQuery = _context.Attendances
                .Include(g => g.Course)
                .Include(g => g.Student)
                .Include(g => g.Teacher)
                .AsQueryable();

        
            if (userRoles.Contains("Student") && !userRoles.Contains("Teacher"))
            {
                attendanceQuery = attendanceQuery.Where(g => g.StudentId == userId);
            }
         
            else if (userRoles.Contains("Teacher") && !userRoles.Contains("Student"))
            {
                attendanceQuery = attendanceQuery.Where(g => g.TeacherId == userId);
            }
           

            var attendance = await attendanceQuery.FirstOrDefaultAsync(g => g.Id == id);

            if (attendance == null)
            {
                return NotFound();
            }

            var attendanceDto = new AttendanceResponseDto
            {
                Id = attendance.Id,
                IsPresent = attendance.IsPresent,
                ExtraPoints = attendance.ExtraPoints,
                Comment = attendance.Comment,
                AttendanceDate = attendance.AttendanceDate,
                CreatedDate = attendance.CreatedDate,
                CourseId = attendance.CourseId,
                CourseName = attendance.Course.Title,
                StudentName = $"{attendance.Student.FirstName} {attendance.Student.LastName}",
                TeacherName = $"{attendance.Teacher.FirstName} {attendance.Teacher.LastName}"
            };

            return attendanceDto;
        }

   
        [HttpGet("teacher")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<AttendanceResponseDto>>> GetTeacherAttendance()
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var attendances = await _context.Attendances
                .Include(a => a.Course)
                .Include(a => a.Student)
                .Include(a => a.Teacher)
                .Where(a => a.TeacherId == teacherId)
                .OrderByDescending(a => a.AttendanceDate)
                .ThenBy(a => a.Course.Title)
                .ThenBy(a => a.Student.LastName)
                .ToListAsync();

            var attendanceDtos = attendances.Select(a => new AttendanceResponseDto
            {
                Id = a.Id,
                IsPresent = a.IsPresent,
                ExtraPoints = a.ExtraPoints,
                Comment = a.Comment,
                AttendanceDate = a.AttendanceDate,
                CreatedDate = a.CreatedDate,
                CourseId = a.CourseId,
                CourseName = a.Course.Title,
                StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
                TeacherName = $"{a.Teacher.FirstName} {a.Teacher.LastName}"
            }).ToList();

            return attendanceDtos;
        }

     
        [HttpGet("teacher/course/{courseId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<AttendanceResponseDto>>> GetTeacherCourseAttendance(int courseId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

           
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId);
            if (course == null)
            {
                return NotFound("Course not found or you don't have permission to view attendance for this course");
            }

            var attendances = await _context.Attendances
                .Include(a => a.Course)
                .Include(a => a.Student)
                .Include(a => a.Teacher)
                .Where(a => a.CourseId == courseId && a.TeacherId == teacherId)
                .OrderByDescending(a => a.AttendanceDate)
                .ThenBy(a => a.Student.LastName)
                .ToListAsync();

            var attendanceDtos = attendances.Select(a => new AttendanceResponseDto
            {
                Id = a.Id,
                IsPresent = a.IsPresent,
                ExtraPoints = a.ExtraPoints,
                Comment = a.Comment,
                AttendanceDate = a.AttendanceDate,
                CreatedDate = a.CreatedDate,
                CourseId = a.CourseId,
                CourseName = a.Course.Title,
                StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
                TeacherName = $"{a.Teacher.FirstName} {a.Teacher.LastName}"
            }).ToList();

            return attendanceDtos;
        }

 
        [HttpGet("teacher/course/{courseId}/date/{date}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<AttendanceResponseDto>>> GetTeacherCourseDateAttendance(int courseId, DateTime date)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId);
            if (course == null)
            {
                return NotFound("Course not found or you don't have permission to view attendance for this course");
            }

            var attendances = await _context.Attendances
                .Include(a => a.Course)
                .Include(a => a.Student)
                .Include(a => a.Teacher)
                .Where(a => a.CourseId == courseId &&
                            a.TeacherId == teacherId &&
                            a.AttendanceDate.Date == date.Date)
                .OrderBy(a => a.Student.LastName)
                .ToListAsync();

            var attendanceDtos = attendances.Select(a => new AttendanceResponseDto
            {
                Id = a.Id,
                IsPresent = a.IsPresent,
                ExtraPoints = a.ExtraPoints,
                Comment = a.Comment,
                AttendanceDate = a.AttendanceDate,
                CreatedDate = a.CreatedDate,
                CourseId = a.CourseId,
                CourseName = a.Course.Title,
                StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
                TeacherName = $"{a.Teacher.FirstName} {a.Teacher.LastName}"
            }).ToList();

            return attendanceDtos;
        }

    
        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<IEnumerable<AttendanceResponseDto>>> GetStudentAttendance()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var attendances = await _context.Attendances
                .Include(a => a.Course)
                .Include(a => a.Student)
                .Include(a => a.Teacher)
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.AttendanceDate)
                .ThenBy(a => a.Course.Title)
                .ToListAsync();

            var attendanceDtos = attendances.Select(a => new AttendanceResponseDto
            {
                Id = a.Id,
                IsPresent = a.IsPresent,
                ExtraPoints = a.ExtraPoints,
                Comment = a.Comment,
                AttendanceDate = a.AttendanceDate,
                CreatedDate = a.CreatedDate,
                CourseId = a.CourseId,
                CourseName = a.Course.Title,
                StudentName = $"{a.Student.FirstName} {a.Student.LastName}",
                TeacherName = $"{a.Teacher.FirstName} {a.Teacher.LastName}"
            }).ToList();

            return attendanceDtos;
        }

      
        [HttpGet("teacher/course/{courseId}/student/{studentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<AttendanceResponseDto>>> GetStudentCourseAttendance(
            int courseId,
            string studentId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

         
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId);
            if (course == null)
            {
                return NotFound("Course not found or you don't have permission to view attendance");
            }

           
            var student = await _userManager.FindByIdAsync(studentId);
            if (student == null)
            {
                return NotFound("Student not found");
            }

            
            var enrollment = await _context.StudentCourses
                .FirstOrDefaultAsync(sc => sc.CourseId == courseId && sc.StudentId == studentId);
            if (enrollment == null)
            {
                return BadRequest("Student is not enrolled in this course");
            }

            var attendance = await _context.Attendances
                .Where(a => a.CourseId == courseId && a.StudentId == studentId)
                .OrderByDescending(a => a.AttendanceDate)
                .Select(a => new AttendanceResponseDto
                {
                    Id = a.Id,
                    IsPresent = a.IsPresent,
                    ExtraPoints = a.ExtraPoints,
                    Comment = a.Comment,
                    AttendanceDate = a.AttendanceDate,
                    CreatedDate = a.CreatedDate,
                    CourseId = a.CourseId,
                    CourseName = course.Title,
                    StudentName = $"{student.FirstName} {student.LastName}",
                    TeacherName = $"{a.Teacher.FirstName} {a.Teacher.LastName}"
                })
                .ToListAsync();

            return Ok(attendance);
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateAttendance(int id, AttendanceCreateDto attendanceDto)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId);

            if (attendance == null)
            {
                return NotFound("Attendance record not found or you don't have permission to update this record");
            }

            attendance.IsPresent = attendanceDto.IsPresent;
            attendance.ExtraPoints = attendanceDto.ExtraPoints;
            attendance.Comment = attendanceDto.Comment;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AttendanceExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteAttendance(int id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId);

            if (attendance == null)
            {
                return NotFound("Attendance record not found or you don't have permission to delete this record");
            }

            _context.Attendances.Remove(attendance);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("teacher/report/course/{courseId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult> GetCourseAttendanceReport(int courseId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId);
            if (course == null)
            {
                return NotFound("Course not found or you don't have permission to view attendance for this course");
            }

            var enrolledStudents = await _context.StudentCourses
                .Where(sc => sc.CourseId == courseId)
                .Include(sc => sc.Student)
                .ToListAsync();

            var attendanceRecords = await _context.Attendances
                .Where(a => a.CourseId == courseId)
                .ToListAsync();

            var report = enrolledStudents.Select(enrollment => {
                var studentId = enrollment.StudentId;
                var studentAttendance = attendanceRecords.Where(a => a.StudentId == studentId).ToList();

                var totalClasses = studentAttendance.Count;
                var presentClasses = studentAttendance.Count(a => a.IsPresent);
                var totalExtraPoints = studentAttendance.Sum(a => a.ExtraPoints);
                var attendanceRate = totalClasses > 0 ? (double)presentClasses / totalClasses * 100 : 0;

                return new
                {
                    StudentId = studentId,
                    StudentName = $"{enrollment.Student.FirstName} {enrollment.Student.LastName}",
                    TotalClasses = totalClasses,
                    PresentClasses = presentClasses,
                    AbsentClasses = totalClasses - presentClasses,
                    AttendanceRate = Math.Round(attendanceRate, 2),
                    TotalExtraPoints = totalExtraPoints
                };
            }).OrderByDescending(r => r.AttendanceRate).ToList();

            return Ok(new
            {
                CourseName = course.Title,
                CourseId = course.Id,
                EnrolledStudents = enrolledStudents.Count,
                StudentReports = report
            });
        }

        private bool AttendanceExists(int id)
        {
            return _context.Attendances.Any(e => e.Id == id);
        }
    }
}