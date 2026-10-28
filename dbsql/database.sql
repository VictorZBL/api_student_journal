create table students
(
	id serial primary key,
	full_name varchar(255) not null,
	"group" varchar(50) not null
);

create table grades
(
	id serial primary key,
	student_id int not null,
	subject varchar(255) not null,
	mark int not null,
	semester int not null,
	"date" date default current_date,
	foreign key (student_id) references students(id)
);

create index idx_students_group on students("group")


-- drop table grades;
-- drop table students;



