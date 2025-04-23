namespace schoolproject.Models
{
    public class StudentCourse
    {
        public int Id { get; set; }
        public string StudentId { get; set; }
        public int CourseId { get; set; }
        public DateTime EnrollmentDate { get; set; }

        public ApplicationUser Student { get; set; }
        public Course Course { get; set; }
    }
}
