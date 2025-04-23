using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using schoolproject.Data;
using schoolproject.Models;
using System.Security.Claims;

namespace schoolproject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EnrollmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public EnrollmentController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpGet("Students")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<StudentDto>>> GetAllStudents()
        {
            var studentsRole = await _roleManager.FindByNameAsync("Student");
            if (studentsRole == null)
                return Ok(new List<StudentDto>());

            var studentsInRole = await _userManager.GetUsersInRoleAsync("Student");

            var studentDtos = studentsInRole.Select(s => new StudentDto
            {
                Id = s.Id,
                Email = s.Email,
                FirstName = s.FirstName,
                LastName = s.LastName
            }).ToList();

            return Ok(studentDtos);
        }

        [HttpGet("TeacherStudents")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<StudentWithCoursesDto>>> GetTeacherStudents()
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    
            var teacherCourseIds = await _context.Courses
                .Where(c => c.TeacherId == teacherId)
                .Select(c => c.Id)
                .ToListAsync();

            if (!teacherCourseIds.Any())
                return Ok(new List<StudentWithCoursesDto>());

            var studentEnrollments = await _context.StudentCourses
                .Where(sc => teacherCourseIds.Contains(sc.CourseId))
                .Include(sc => sc.Student)
                .Include(sc => sc.Course)
                .ThenInclude(c => c.Teacher)
                .ToListAsync();

            var groupedByStudent = studentEnrollments
                .GroupBy(sc => sc.StudentId)
                .Select(g => new StudentWithCoursesDto
                {
                    Id = g.First().Student.Id,
                    Email = g.First().Student.Email,
                    FirstName = g.First().Student.FirstName,
                    LastName = g.First().Student.LastName,
                    Courses = g.Select(e => new CourseResponseDto
                    {
                        Id = e.Course.Id,
                        Title = e.Course.Title,
                        Description = e.Course.Description,
                        CreatedDate = e.Course.CreatedDate,
                        TeacherName = $"{e.Course.Teacher.FirstName} {e.Course.Teacher.LastName}"
                    }).ToList()
                })
                .ToList();

            return Ok(groupedByStudent);
        }

 
        [HttpGet("TeacherCourses")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetTeacherCourses()
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var courses = await _context.Courses
                .Where(c => c.TeacherId == teacherId)
                .Select(c => new CourseResponseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    CreatedDate = c.CreatedDate,
                    TeacherName = $"{c.Teacher.FirstName} {c.Teacher.LastName}"
                })
                .ToListAsync();

            return Ok(courses);
        }

    
        [HttpPost("EnrollStudent")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            
            var course = await _context.Courses
                .Include(c => c.Teacher)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.TeacherId == teacherId);

            if (course == null)
                return NotFound("Course not found or you don't have permission to enroll students in this course");

        
            var student = await _userManager.FindByEmailAsync(request.StudentEmail);
            if (student == null)
                return NotFound($"Student with email {request.StudentEmail} not found");

       
            if (!await _userManager.IsInRoleAsync(student, "Student"))
                return BadRequest($"The user with email {request.StudentEmail} is not a student");

            
            var existingEnrollment = await _context.StudentCourses
                .FirstOrDefaultAsync(sc => sc.StudentId == student.Id && sc.CourseId == request.CourseId);

            if (existingEnrollment != null)
                return BadRequest($"Student {request.StudentEmail} is already enrolled in this course");

          
            var enrollment = new StudentCourse
            {
                StudentId = student.Id,
                CourseId = request.CourseId,
                EnrollmentDate = DateTime.Now
            };

            _context.StudentCourses.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = $"Student {student.FirstName} {student.LastName} ({request.StudentEmail}) enrolled successfully in course {course.Title}"
            });
        }

        
        [HttpPost("BatchEnroll")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> BatchEnrollStudents([FromBody] BatchEnrollRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

   
            var course = await _context.Courses
                .Include(c => c.Teacher)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.TeacherId == teacherId);

            if (course == null)
                return NotFound("Course not found or you don't have permission to enroll students in this course");

            var results = new List<object>();

            foreach (var email in request.StudentEmails)
            {
                
                var student = await _userManager.FindByEmailAsync(email);
                if (student == null)
                {
                    results.Add(new { Email = email, Status = "Failed", Message = "Student not found" });
                    continue;
                }

               
                if (!await _userManager.IsInRoleAsync(student, "Student"))
                {
                    results.Add(new { Email = email, Status = "Failed", Message = "User is not a student" });
                    continue;
                }

                
                var existingEnrollment = await _context.StudentCourses
                    .FirstOrDefaultAsync(sc => sc.StudentId == student.Id && sc.CourseId == request.CourseId);

                if (existingEnrollment != null)
                {
                    results.Add(new { Email = email, Status = "Skipped", Message = "Already enrolled" });
                    continue;
                }

               
                var enrollment = new StudentCourse
                {
                    StudentId = student.Id,
                    CourseId = request.CourseId,
                    EnrollmentDate = DateTime.Now
                };

                _context.StudentCourses.Add(enrollment);
                results.Add(new
                {
                    Email = email,
                    Status = "Success",
                    Message = $"Enrolled {student.FirstName} {student.LastName}"
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                CourseTitle = course.Title,
                EnrollmentResults = results
            });
        }
    }
    public class EnrollStudentRequest
    {
        public string StudentEmail { get; set; }
        public int CourseId { get; set; }
    }


    public class BatchEnrollRequest
    {
        public List<string> StudentEmails { get; set; }
        public int CourseId { get; set; }
    }

}