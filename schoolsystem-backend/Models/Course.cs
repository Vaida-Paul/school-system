namespace schoolproject.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Timetable { get; set; } // 'luni/12:30 am/everyday'
        public string Color { get; set; }
        public DateTime CreatedDate { get; set; }
        public string TeacherId { get; set; }
        public string Location { get; set; }
        public DateTime? ExamDate { get; set; } 

      
        public ApplicationUser Teacher { get; set; }
        public ICollection<StudentCourse> Enrollments { get; set; }
    }
}
