namespace schoolproject.Models
{
    public class Grade
    {
        public int Id { get; set; }
        public float Mark { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedDate { get; set; }

    
        public int CourseId { get; set; }
        public string StudentId { get; set; }
        public string TeacherId { get; set; }

       
        public Course Course { get; set; }
        public ApplicationUser Student { get; set; }
        public ApplicationUser Teacher { get; set; }
    }
}