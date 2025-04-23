using Microsoft.AspNetCore.Identity;

namespace schoolproject.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }

        
        public ICollection<Course> TaughtCourses { get; set; }

        
        public ICollection<StudentCourse> Enrollments { get; set; }
    }
}
