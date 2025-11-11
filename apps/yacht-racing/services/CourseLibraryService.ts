/**
 * Course Library Service
 * Fetches, stores, and tracks racing courses for sailors, clubs, and venues.
 */

import { supabase } from './supabase';
import type {
  RaceCourse,
  CourseFilterOptions,
  CourseValidation,
  CourseScope,
  Mark,
} from '@betterat/core/types/courses';

export class CourseLibraryService {
  /**
   * Fetch courses with optional filters for club/venue/type/search/wind.
   */
  static async fetchCourses(options: CourseFilterOptions = {}): Promise<RaceCourse[]> {
    try {
      let query = supabase
        .from('race_courses')
        .select('*')
        .order('last_used_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (options.clubId) {
        query = query.eq('club_id', options.clubId);
      }

      if (options.venueId) {
        query = query.eq('venue_id', options.venueId);
      }

      if (options.courseType) {
        query = query.eq('course_type', options.courseType);
      }

      if (options.searchQuery) {
        query = query.or(
          `name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('[CourseLibraryService] Error fetching courses:', error);
        throw error;
      }

      let courses = data || [];

      if (options.windDirection !== undefined) {
        courses = courses.filter((course) => {
          if (course.min_wind_direction == null || course.max_wind_direction == null) {
            return true;
          }
          return (
            course.min_wind_direction <= options.windDirection! &&
            course.max_wind_direction >= options.windDirection!
          );
        });
      }

      if (options.windSpeed !== undefined) {
        courses = courses.filter((course) => {
          if (course.min_wind_speed == null || course.max_wind_speed == null) {
            return true;
          }
          return (
            course.min_wind_speed <= options.windSpeed! &&
            course.max_wind_speed >= options.windSpeed!
          );
        });
      }

      return courses as RaceCourse[];
    } catch (error) {
      console.error('[CourseLibraryService] Error in fetchCourses:', error);
      return [];
    }
  }

  /**
   * Fetch courses for a specific scope (personal, club, venue).
   */
  static async fetchCoursesByScope(
    scope: CourseScope,
    options: {
      userId?: string;
      clubId?: string;
      venueId?: string;
      searchQuery?: string;
    } = {}
  ): Promise<RaceCourse[]> {
    try {
      let query = supabase.from('race_courses').select('*');

      switch (scope) {
        case 'personal':
          if (!options.userId) {
            console.warn('[CourseLibraryService] userId required for personal scope');
            return [];
          }
          query = query.eq('created_by', options.userId).is('club_id', null);
          break;
        case 'club':
          if (!options.clubId) {
            console.warn('[CourseLibraryService] clubId required for club scope');
            return [];
          }
          query = query.eq('club_id', options.clubId);
          break;
        case 'venue':
          if (!options.venueId) {
            console.warn('[CourseLibraryService] venueId required for venue scope');
            return [];
          }
          query = query.eq('venue_id', options.venueId).is('club_id', null);
          break;
      }

      if (options.searchQuery) {
        query = query.or(
          `name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
        );
      }

      query = query
        .order('last_used_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('[CourseLibraryService] Error fetching courses:', error);
        throw error;
      }

      return (data || []) as RaceCourse[];
    } catch (error) {
      console.error('[CourseLibraryService] Error in fetchCoursesByScope:', error);
      return [];
    }
  }

  /**
   * Persist a new course to the shared library.
   */
  static async saveCourse(
    course: Omit<RaceCourse, 'id' | 'created_at' | 'updated_at'>,
    scope: CourseScope,
    userId: string
  ): Promise<RaceCourse | null> {
    try {
      const courseData = {
        ...course,
        created_by: userId,
        club_id: scope === 'club' ? course.club_id : null,
        venue_id: scope === 'venue' ? course.venue_id : null,
        usage_count: 0,
      };

      const { data, error } = await supabase
        .from('race_courses')
        .insert(courseData)
        .select()
        .single();

      if (error) {
        console.error('[CourseLibraryService] Error saving course:', error);
        throw error;
      }

      return data as RaceCourse;
    } catch (error) {
      console.error('[CourseLibraryService] Error in saveCourse:', error);
      return null;
    }
  }

  /**
   * Update an existing course entry.
   */
  static async updateCourse(
    courseId: string,
    updates: Partial<RaceCourse>
  ): Promise<RaceCourse | null> {
    try {
      const { data, error } = await supabase
        .from('race_courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        console.error('[CourseLibraryService] Error updating course:', error);
        throw error;
      }

      return data as RaceCourse;
    } catch (error) {
      console.error('[CourseLibraryService] Error in updateCourse:', error);
      return null;
    }
  }

  /**
   * Delete a stored course.
   */
  static async deleteCourse(courseId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('race_courses').delete().eq('id', courseId);

      if (error) {
        console.error('[CourseLibraryService] Error deleting course:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[CourseLibraryService] Error in deleteCourse:', error);
      return false;
    }
  }

  /**
   * Track course usage so we can show recents and popularity.
   */
  static async recordCourseUsage(courseId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_course_usage', {
        course_id: courseId,
      });

      if (error) {
        const { data: course } = await supabase
          .from('race_courses')
          .select('usage_count')
          .eq('id', courseId)
          .single();

        if (course) {
          await supabase
            .from('race_courses')
            .update({
              usage_count: (course.usage_count || 0) + 1,
              last_used_date: new Date().toISOString().split('T')[0],
            })
            .eq('id', courseId);
        }
      }
    } catch (error) {
      console.error('[CourseLibraryService] Error recording usage:', error);
    }
  }

  /**
   * Return recently used courses for a sailor.
   */
  static async getRecentlyUsed(userId: string, limit: number = 5): Promise<RaceCourse[]> {
    try {
      const { data, error } = await supabase
        .from('race_courses')
        .select('*')
        .eq('created_by', userId)
        .not('last_used_date', 'is', null)
        .order('last_used_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[CourseLibraryService] Error fetching recently used:', error);
        return [];
      }

      return (data || []) as RaceCourse[];
    } catch (error) {
      console.error('[CourseLibraryService] Error in getRecentlyUsed:', error);
      return [];
    }
  }

  /**
   * Validate a course before persisting or using it in a race.
   */
  static validateCourse(course: RaceCourse): CourseValidation {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!course.marks || course.marks.length === 0) {
      errors.push('Course must have at least one mark');
    }

    const hasStart = course.marks?.some((mark) => mark.type === 'start');
    if (!hasStart) {
      warnings.push('Course should have a start mark');
    }

    const hasFinish = course.marks?.some((mark) => mark.type === 'finish');
    if (!hasFinish) {
      warnings.push('Course should have a finish mark');
    }

    if (course.marks && course.marks.length > 1) {
      for (let i = 0; i < course.marks.length; i++) {
        for (let j = i + 1; j < course.marks.length; j++) {
          const distance = this.calculateDistance(
            course.marks[i].latitude,
            course.marks[i].longitude,
            course.marks[j].latitude,
            course.marks[j].longitude
          );

          if (distance < 0.05) {
            warnings.push(
              `Marks "${course.marks[i].name}" and "${course.marks[j].name}" are very close (${(distance * 1852).toFixed(0)}m)`
            );
          }
        }
      }
    }

    course.marks?.forEach((mark) => {
      if (Math.abs(mark.latitude) > 90 || Math.abs(mark.longitude) > 180) {
        errors.push(`Mark "${mark.name}" has invalid coordinates`);
      }
    });

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3440.065; // nautical miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export default CourseLibraryService;
