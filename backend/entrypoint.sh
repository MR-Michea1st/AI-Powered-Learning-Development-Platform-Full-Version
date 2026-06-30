#!/bin/bash
set -e

echo "Applying database migrations..."
python manage.py migrate

echo "Checking if database needs initialization..."

COURSE_COUNT=$(python manage.py shell -c "
from courses.models import Course
print(Course.objects.count())
" | tail -n 1)

if [ "$COURSE_COUNT" = "0" ]; then
    echo "Loading initial fixtures..."

    python manage.py loaddata fixtures/users.json
    python manage.py loaddata fixtures/courses.json
    python manage.py loaddata fixtures/tracks.json
    python manage.py loaddata fixtures/trackcourses.json

    echo "Fixtures loaded."
    echo "Courses in database:"
    python manage.py shell -c "
    from courses.models import Course
    print('Course count:', Course.objects.count())
    print(list(Course.objects.values('id', 'title')))
    "
else
    echo "Database already initialized. Skipping fixtures."
fi

exec "$@"