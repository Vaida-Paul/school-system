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
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public CoursesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }
=
        [HttpGet]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetTeacherCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound("User not found");

            var courses = await _context.Courses
                .Where(c => c.TeacherId == userId)
                .Select(c => new CourseResponseDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    Timetable = c.Timetable,
                    Color = c.Color,
                    Location = c.Location,
                    ExamDate = c.ExamDate,
                    CreatedDate = c.CreatedDate,
                    TeacherName = $"{user.FirstName} {user.LastName}"
                })
                .ToListAsync();

            return Ok(courses);
        }
     
        [HttpGet("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<CourseResponseDto>> GetCourse(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var course = await _context.Courses
                .Include(c => c.Teacher)
                .FirstOrDefaultAsync(c => c.Id == id && c.TeacherId == userId);

            if (course == null)
                return NotFound("Course not found or you don't have permission to access it");

            return Ok(new CourseResponseDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Timetable = course.Timetable,
                Color = course.Color,
                Location = course.Location,
                ExamDate = course.ExamDate,
                CreatedDate = course.CreatedDate,
                TeacherName = $"{course.Teacher.FirstName} {course.Teacher.LastName}"
            });
        }

        [HttpPost]
        [Authorize(Roles = "Teacher")] 
        public async Task<ActionResult<CourseResponseDto>> CreateCourse([FromBody] CourseCreateDto courseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound("User not found");

            var course = new Course
            {
                Title = courseDto.Title,
                Description = courseDto.Description,
                Timetable = courseDto.Timetable,  
                Color = courseDto.Color,         
                Location = courseDto.Location,
                TeacherId = userId,
                CreatedDate = DateTime.Now
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var responseDto = new CourseResponseDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Timetable = course.Timetable,    
                Color = course.Color,           
                Location = course.Location,
                ExamDate = course.ExamDate,
                CreatedDate = course.CreatedDate,
                TeacherName = $"{user.FirstName} {user.LastName}"
            };

            return CreatedAtAction(nameof(GetTeacherCourses), new { id = course.Id }, responseDto);
        }

        [HttpPut("{id}/programed-exam")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateProgramedExam(int id, [FromBody] ProgramedExamUpdateDto examDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == id && c.TeacherId == userId);

            if (course == null)
                return NotFound("Course not found or you don't have permission to update it");

            // Update only exam-related properties
            course.ExamDate = examDto.ExamDate;
            course.Location = examDto.Location;

            await _context.SaveChangesAsync();
            return Ok(new
            {
                Message = "Exam scheduled successfully",
                ExamDate = course.ExamDate,
                Location = course.Location
            });
        }
 
        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == id && c.TeacherId == userId);

            if (course == null)
                return NotFound("Course not found or you don't have permission to delete it");

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Course deleted successfully",
                CourseId = id,
                CourseTitle = course.Title
            });
        }

        private bool CourseExists(int id)
        {
            return _context.Courses.Any(e => e.Id == id);
        }
    }
}
