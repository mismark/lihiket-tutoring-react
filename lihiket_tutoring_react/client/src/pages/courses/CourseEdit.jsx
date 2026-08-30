import { updateCourse } from '../../api/course.api';
import CourseForm       from './CourseForm';
import toast            from 'react-hot-toast';

export default function CourseEdit({ course, onClose, onUpdated }) {
  if (!course) return null;

  const handleSubmit = async (data) => {
    await updateCourse(course._id, data);
    toast.success('Course updated');
    onUpdated();
    onClose();
  };

  return (
    <CourseForm
      title="Edit Course"
      submitLabel="Save Changes"
      initial={course}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
