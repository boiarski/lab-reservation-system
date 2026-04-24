INSERT INTO users (name, email, password_hash, role, active)
VALUES
    (
        'Admin User',
        'admin@test.com',
        '$2y$10$2EZIkdqdINhhmGi4lHInC.iPsbOJzf6950x38xe2DAf4UXDtzDRiO',
        'admin',
        TRUE
    ),
    (
        'Helper User',
        'helper@test.com',
        '$2y$10$/O5WObNOqDod4qU7A.oaYOFw63jk3pO7WjQTGegJM75SGeda7uUEq',
        'helper',
        TRUE
    ),
    (
        'Regular User',
        'user@test.com',
        '$2y$10$PNzM2HsxpiY99nimnAs5rewxQCzgyU16RSiIxtUxhL4nwKJEO8t8.',
        'user',
        TRUE
    );

INSERT INTO equipment (name, description, status)
VALUES
    ('Microscope', 'Optical microscope', 'available'),
    ('Centrifuge', 'Lab centrifuge', 'available'),
    ('PCR Machine', 'Thermal cycler', 'available');