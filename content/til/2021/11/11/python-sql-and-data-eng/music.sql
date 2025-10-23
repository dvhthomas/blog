/*
 TODO - print the artist name and album count
 
 ArtistName  AlbumCount
 ----------  ----------
 Lost        3         
 Creedence   2         
 The Office  2  
 
 ONLY those artists who have released:
 
 - at least 2 albums
 - each having at least 20 tracks on them.
 
 Tip: the .tables and .schema [table] commands are handy!
 */
.open sample.db
.headers on
.mode column

WITH tracks_and_artists AS (
	SELECT t.albumid,
		albums.artistid,
		artists.name,
		COUNT(t.trackid) as track_count
	FROM tracks t
		INNER JOIN albums on albums.albumid = t.albumid
		INNER JOIN artists on artists.artistid = albums.artistid
	GROUP BY t.albumid,
		albums.title,
		albums.artistid
	HAVING track_count >= 20
)
SELECT name as ArtistName,
	COUNT(albumid) as AlbumCount
FROM tracks_and_artists
GROUP BY ArtistName
HAVING AlbumCount >= 2
ORDER BY AlbumCount DESC;
