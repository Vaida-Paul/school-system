namespace schoolproject.Models
{
    public class CourseCreateDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Timetable { get; set; } // 'luni/12:30 am/everyday'
        public string Color { get; set; }
        public string Location { get; set; }
        public DateTime? ExamDate { get; set; } 
    }
}
