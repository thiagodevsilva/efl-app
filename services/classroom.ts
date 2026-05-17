import { api } from "./api";

export type LessonAttachment = {
  url?: string;
  kind: "URL" | "FILE";
  name?: string;
  mime?: string;
  path?: string;
  size?: number;
  title?: string | null;
  description?: string | null;
};

export type LessonForClassroom = {
  id: string;
  title: string;
  order: number;
  content?: string | null;
  htmlContent?: string | null;
  videoPath?: string | null;
  videoUrl?: string | null;
  attachments?: LessonAttachment[] | null;
};

export type CourseClassroom = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  lessons: LessonForClassroom[];
};

export type ClassLessonForClassroom = LessonForClassroom & {
  description?: string | null;
  imagePath?: string | null;
  links?: { name?: string; url: string }[];
};

export type ClassClassroom = {
  id: string;
  name: string;
  description?: string | null;
  level?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  hasOnlineClasses?: boolean;
  onlineDays?: string[];
  onlineTime?: string | null;
  attachments: LessonAttachment[];
  lessons: ClassLessonForClassroom[];
};

export type MyCourseItem = {
  id: string;
  title: string;
  slug: string;
  status?: string;
  progress?: number | null;
};

export type StandaloneEnrollmentItem = {
  id: string;
  title: string | null;
  description: string | null;
  startedAt: string;
  endedAt: string | null;
  status: string;
};

export type MyClassItem = {
  id: string;
  name: string;
  level?: string | null;
  enrollmentStatus?: string;
};

export type ListMyCoursesResponse = {
  courses: MyCourseItem[];
  standaloneEnrollments: StandaloneEnrollmentItem[];
  classes: MyClassItem[];
};

export type EnrollmentClassroomPayload = {
  id: string;
  title: string | null;
  description: string | null;
  startedAt: string;
  endedAt: string | null;
  status: string;
  attachments: LessonAttachment[];
};

export async function listMyCourses(): Promise<ListMyCoursesResponse> {
  const { data } = await api.get<{ data: ListMyCoursesResponse }>("/courses/my");
  const payload = (data as { data?: ListMyCoursesResponse })?.data ?? (data as unknown as ListMyCoursesResponse);
  if (Array.isArray(payload)) {
    return { courses: payload as MyCourseItem[], standaloneEnrollments: [], classes: [] };
  }
  return {
    courses: payload?.courses ?? [],
    standaloneEnrollments: payload?.standaloneEnrollments ?? [],
    classes: payload?.classes ?? [],
  };
}

export async function getClassroomCourse(slug: string): Promise<CourseClassroom> {
  const { data } = await api.get<{ data: CourseClassroom }>(`/classroom/${encodeURIComponent(slug)}`);
  return data.data;
}

export async function getClassroomClass(classId: string): Promise<ClassClassroom> {
  const { data } = await api.get<{ data: ClassClassroom }>(
    `/classroom/class/${encodeURIComponent(classId)}`,
  );
  return data.data;
}

export async function getClassroomEnrollment(enrollmentId: string): Promise<EnrollmentClassroomPayload> {
  const { data } = await api.get<{ data: EnrollmentClassroomPayload }>(
    `/classroom/enrollment/${encodeURIComponent(enrollmentId)}`,
  );
  return data.data;
}
