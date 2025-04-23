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
    public class GradesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public GradesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        
        [HttpPost]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<GradeResponseDto>> AddGrade(GradeCreateDto gradeDto)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            
            var student = await _userManager.FindByIdAsync(gradeDto.StudentId);
            if (student == null)
            {
                return NotFound("Student not found");
            }

            
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == gradeDto.CourseId && c.TeacherId == teacherId);
            if (course == null)
            {
                return NotFound("Course not found or you don't have permission to add grades to this course");
            }

            
            var enrollment = await _context.StudentCourses
                .FirstOrDefaultAsync(sc => sc.CourseId == gradeDto.CourseId && sc.StudentId == gradeDto.StudentId);
            if (enrollment == null)
            {
                return BadRequest("Student is not enrolled in this course");
            }

            var grade = new Grade
            {
                Mark = gradeDto.Mark,
                Comment = gradeDto.Comment,
                CourseId = gradeDto.CourseId,
                StudentId = gradeDto.StudentId,
                TeacherId = teacherId,
                CreatedDate = DateTime.UtcNow
            };

            _context.Grades.Add(grade);
            await _context.SaveChangesAsync();

          
            var teacher = await _userManager.FindByIdAsync(teacherId);

            var responseDto = new GradeResponseDto
            {
                Id = grade.Id,
                Mark = grade.Mark,
                Comment = grade.Comment,
                CreatedDate = grade.CreatedDate,
                CourseId = grade.CourseId,
                CourseName = course.Title,
                StudentName = $"{student.FirstName} {student.LastName}",
                TeacherName = $"{teacher.FirstName} {teacher.LastName}"
            };

            return CreatedAtAction(nameof(GetGradeById), new { id = grade.Id }, responseDto);
        }

        
        [HttpGet("{id}")]
        public async Task<ActionResult<GradeResponseDto>> GetGradeById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

           
            var gradeQuery = _context.Grades
                .Include(g => g.Course)
                .Include(g => g.Student)
                .Include(g => g.Teacher)
                .AsQueryable();

            
            if (userRoles.Contains("Student") && !userRoles.Contains("Teacher"))
            {
                gradeQuery = gradeQuery.Where(g => g.StudentId == userId);
            }
            
            else if (userRoles.Contains("Teacher") && !userRoles.Contains("Student"))
            {
                gradeQuery = gradeQuery.Where(g => g.TeacherId == userId);
            }
            

            var grade = await gradeQuery.FirstOrDefaultAsync(g => g.Id == id);

            if (grade == null)
            {
                return NotFound();
            }

            var gradeDto = new GradeResponseDto
            {
                Id = grade.Id,
                Mark = grade.Mark,
                Comment = grade.Comment,
                CreatedDate = grade.CreatedDate,
                CourseId = grade.CourseId,
                CourseName = grade.Course.Title,
                StudentName = $"{grade.Student.FirstName} {grade.Student.LastName}",
                TeacherName = $"{grade.Teacher.FirstName} {grade.Teacher.LastName}"
            };

            return gradeDto;
        }

        
        
        [HttpGet("teacher")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<GradeResponseDto>>> GetTeacherGrades()
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var grades = await _context.Grades
                .Include(g => g.Course)
                .Include(g => g.Student)
                .Include(g => g.Teacher)
                .Where(g => g.TeacherId == teacherId)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();

            var gradeDtos = grades.Select(g => new GradeResponseDto
            {
                Id = g.Id,
                Mark = g.Mark,
                Comment = g.Comment,
                CreatedDate = g.CreatedDate,
                CourseId = g.CourseId,
                CourseName = g.Course.Title,
                StudentName = $"{g.Student.FirstName} {g.Student.LastName}",
                TeacherName = $"{g.Teacher.FirstName} {g.Teacher.LastName}"
            }).ToList();

            return gradeDtos;
        }

      
        [HttpGet("teacher/course/{courseId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<ActionResult<IEnumerable<GradeResponseDto>>> GetTeacherCourseGrades(int courseId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            
            var course = await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId && c.TeacherId == teacherId);
            if (course == null)
            {
                return NotFound("Course not found or you don't have permission to view grades for this course");
            }

            var grades = await _context.Grades
                .Include(g => g.Course)
                .Include(g => g.Student)
                .Include(g => g.Teacher)
                .Where(g => g.CourseId == courseId && g.TeacherId == teacherId)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();

            var gradeDtos = grades.Select(g => new GradeResponseDto
            {
                Id = g.Id,
                Mark = g.Mark,
                Comment = g.Comment,
                CreatedDate = g.CreatedDate,
                CourseId = g.CourseId,
                CourseName = g.Course.Title,
                StudentName = $"{g.Student.FirstName} {g.Student.LastName}",
                TeacherName = $"{g.Teacher.FirstName} {g.Teacher.LastName}"
            }).ToList();

            return gradeDtos;
        }

        
        [HttpGet("student")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<IEnumerable<GradeResponseDto>>> GetStudentGrades()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var grades = await _context.Grades
                .Include(g => g.Course)
                .Include(g => g.Student)
                .Include(g => g.Teacher)
                .Where(g => g.StudentId == studentId)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();

            var gradeDtos = grades.Select(g => new GradeResponseDto
            {
                Id = g.Id,
                Mark = g.Mark,
                Comment = g.Comment,
                CreatedDate = g.CreatedDate,
                CourseId = g.CourseId,
                CourseName = g.Course.Title,
                StudentName = $"{g.Student.FirstName} {g.Student.LastName}",
                TeacherName = $"{g.Teacher.FirstName} {g.Teacher.LastName}"
            }).ToList();

            return gradeDtos;
        }

        
        [HttpGet("student/course/{courseId}")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<IEnumerable<GradeResponseDto>>> GetStudentCourseGrades(int courseId)
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);

           
            var enrollment = await _context.StudentCourses
                .FirstOrDefaultAsync(sc => sc.CourseId == courseId && sc.StudentId == studentId);
            if (enrollment == null)
            {
                return NotFound("You are not enrolled in this course");
            }

            var grades = await _context.Grades
                .Include(g => g.Course)
                .Include(g => g.Student)
                .Include(g => g.Teacher)
                .Where(g => g.CourseId == courseId && g.StudentId == studentId)
                .OrderByDescending(g => g.CreatedDate)
                .ToListAsync();

            var gradeDtos = grades.Select(g => new GradeResponseDto
            {
                Id = g.Id,
                Mark = g.Mark,
                Comment = g.Comment,
                CreatedDate = g.CreatedDate,
                CourseId = g.CourseId,
                CourseName = g.Course.Title,
                StudentName = $"{g.Student.FirstName} {g.Student.LastName}",
                TeacherName = $"{g.Teacher.FirstName} {g.Teacher.LastName}"
            }).ToList();

            return gradeDtos;
        }

       
        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateGrade(int id, GradeCreateDto gradeDto)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var grade = await _context.Grades
                .FirstOrDefaultAsync(g => g.Id == id && g.TeacherId == teacherId);

            if (grade == null)
            {
                return NotFound("Grade not found or you don't have permission to update this grade");
            }

 
            grade.Mark = gradeDto.Mark;
            grade.Comment = gradeDto.Comment;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GradeExists(id))
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
        public async Task<IActionResult> DeleteGrade(int id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var grade = await _context.Grades
                .FirstOrDefaultAsync(g => g.Id == id && g.TeacherId == teacherId);

            if (grade == null)
            {
                return NotFound("Grade not found or you don't have permission to delete this grade");
            }

            _context.Grades.Remove(grade);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GradeExists(int id)
        {
            return _context.Grades.Any(e => e.Id == id);
        }
    }
}