namespace schoolproject.Models
{
    public class GradeCreateDto
    {
        public float Mark { get; set; }
        public string Comment { get; set; }
        public int CourseId { get; set; }
        public string StudentId { get; set; }
    }
}