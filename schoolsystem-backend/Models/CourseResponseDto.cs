namespace schoolproject.Models
{
    public class CourseResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Timetable { get; set; } // 'luni/12:30 am/repeat123(norepeat)'
        public string Color { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public string TeacherName { get; set; }
        public DateTime? ExamDate { get; set; } 
    }
}
