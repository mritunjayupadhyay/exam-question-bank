CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(20) NOT NULL,
	CONSTRAINT "questions_name_unique" UNIQUE("name"),
	CONSTRAINT "questions_code_unique" UNIQUE("code")
);
