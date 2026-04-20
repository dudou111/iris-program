-- 创建数据库
CREATE DATABASE iris_program
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Chinese (Simplified)_China.936'
    LC_CTYPE = 'Chinese (Simplified)_China.936'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 连接到新创建的数据库
\c iris_program

-- 数据库创建成功提示
SELECT 'Database iris_program created successfully!' as message;
