export class AutoCourseGeneratorService {
  async generateCourse(params: any) {
    console.warn('AutoCourseGeneratorService: Stub');
    return { marks: [], distance: 0, params };
  }
}

export const autoCourseGeneratorService = new AutoCourseGeneratorService();
