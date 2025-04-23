
namespace schoolproject.Models
{
    public class GradeResponseDto
    {
        public int Id { get; set; }
        public float Mark { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CourseId { get; set; }
        public string CourseName { get; set; }
        public string StudentName { get; set; }
        public string TeacherName { get; set; }
    }
}