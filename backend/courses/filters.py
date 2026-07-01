import django_filters
from django.db.models import Q
from courses.models import Course,Track,Enrollment,TrackEnrollment
from .models import Level

class SearchFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_by_name')
    tags = django_filters.CharFilter(method='filter_by_tag')
    def filter_by_name(self, queryset, name, value):
        keywords = [word for word in value.split() if word.strip()]

        query = Q()
        for word in keywords:
            query |= Q(**{f"{self.search_field}__icontains" : word})
            
        return queryset.filter(query)
    
    def filter_by_tag(self, queryset, name, value):
        request = self.request
        tags = request.query_params.getlist("tags")

        if not tags:
            return queryset

        for tag in tags:
            queryset = queryset.filter(tags__icontains=tag)

        return queryset

class CourseFilter(SearchFilter) :
    search_field = 'name'
    tags_field = 'tags'
    difficulty_level = django_filters.MultipleChoiceFilter(choices = Level)
    class Meta :
        model = Course
        fields=['difficulty_level' , 'tags']


class TrackFilter(SearchFilter) :
    search_field = 'name'
    class Meta :
        model = Track
        fields=[]

class EnrollmentCourseFilter(SearchFilter) :
    search_field = 'course__name'
    class Meta :
        model = Enrollment
        fields=[]

class EnrollmentTrackFilter(SearchFilter) :
    search_field = 'track__name'
    class Meta :
        model = TrackEnrollment
        fields=[]