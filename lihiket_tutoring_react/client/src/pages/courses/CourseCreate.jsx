import { createCourse } from '../../api/course.api';
import CourseForm       from './CourseForm';
import toast            from 'react-hot-toast';

export default function CourseCreate({ subjectId, onClose, onCreated }) {
  const handleSubmit = async (data) => {
    await createCourse({ ...data, subjectId });
    toast.success('Course created successfully');
    onCreated();
    onClose();
  };

  return (
    <CourseForm
      title="Create New Course"
      submitLabel="Create Course"
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
