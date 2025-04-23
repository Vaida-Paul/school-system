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
    [Authorize(Roles = "Student")]
    public class StudentCoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public StudentCoursesController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetEnrolledCourses()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var enrolledCourses = await _context.StudentCourses
                .Where(sc => sc.StudentId == studentId)
                .Include(sc => sc.Course)
                .ThenInclude(c => c.Teacher)
                .Select(sc => new CourseResponseDto
                {
                    Id = sc.Course.Id,
                    Title = sc.Course.Title,
                    Description = sc.Course.Description,
                    CreatedDate = sc.Course.CreatedDate,
                    Color =sc.Course.Color,
                    Timetable = sc.Course.Timetable,
                    ExamDate = sc.Course.ExamDate,
                    Location = sc.Course.Location,
                    TeacherName = $"{sc.Course.Teacher.FirstName} {sc.Course.Teacher.LastName}",

                })
                .ToListAsync();

            return Ok(enrolledCourses);
        }
    }
}
