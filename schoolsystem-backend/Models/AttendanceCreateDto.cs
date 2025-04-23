namespace schoolproject.Models
{
    public class AttendanceCreateDto
    {
        public bool IsPresent { get; set; }
        public float ExtraPoints { get; set; }
        public string Comment { get; set; }
        public DateTime AttendanceDate { get; set; }
        public int CourseId { get; set; }
        public string StudentId { get; set; }
    }
}