namespace schoolproject.Models
{
    public class Attendance
    {
        public int Id { get; set; }
        public bool IsPresent { get; set; }
        public float ExtraPoints { get; set; }
        public string Comment { get; set; }
        public DateTime AttendanceDate { get; set; }
        public DateTime CreatedDate { get; set; }

       
        public int CourseId { get; set; }
        public string StudentId { get; set; }
        public string TeacherId { get; set; }

        
        public Course Course { get; set; }
        public ApplicationUser Student { get; set; }
        public ApplicationUser Teacher { get; set; }
    }
}