
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS docspace_url text;

INSERT INTO public.events (title, creator, date, time, address, description, background_image_url, target_date, docspace_url)
VALUES
  ('Harvard Classic CV', 'DocSpace', 'JUL 05', '00:00', 'Editable in browser', 'Full-fidelity Word template. Edit in-browser, download as DOCX or PDF.', '/__l5e/assets-v1/020f4899-201f-415d-93d8-c5022f86282a/harvard_university_cv.png', now() + interval '30 days', 'https://docspace-bg94v1.onlyoffice.com/s/MX8VCKSGCqZPZX9'),
  ('Modern Professional CV', 'DocSpace', 'JUL 05', '00:00', 'Editable in browser', 'Full-fidelity Word template. Edit in-browser, download as DOCX or PDF.', '/__l5e/assets-v1/29b86884-adca-4b86-92a4-92ae80ac7f56/jeff-modern.png', now() + interval '30 days', 'https://docspace-bg94v1.onlyoffice.com/s/rjVgN5nvLb7YyPY'),
  ('Deedy Technical CV', 'DocSpace', 'JUL 05', '00:00', 'Editable in browser', 'Full-fidelity Word template. Edit in-browser, download as DOCX or PDF.', '/__l5e/assets-v1/8c1fe8f2-b900-4312-a02e-9f891efb427b/deedy.png', now() + interval '30 days', 'https://docspace-bg94v1.onlyoffice.com/s/zY78MwDL5n8ZYck');
