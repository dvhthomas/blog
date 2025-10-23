cloud-run-service := svc-traintrack
service-account := svc-acct-traintrack
gcp-project := exp-traintrack-tf
db := ./training.db
image := traintrack-tf
tag = latest
region := us-west1
artifact-repo :=  traintrack-repo
hostname := $(region)-docker.pkg.dev/$(gcp-project)/$(artifact-repo)

.PHONY: data
data: clean
	csvs-to-sqlite --replace-tables --primary-key code data/courses.csv $(db)
	csvs-to-sqlite --replace-tables --primary-key email data/people.csv $(db)
	csvs-to-sqlite --replace-tables --primary-key id data/certs.csv $(db)
	sqlite-utils add-foreign-key $(db) certs course courses code 
	sqlite-utils add-foreign-key $(db) certs person people email
	sqlite3 $(db) < data/awards.sql

run: data
	datasette $(db) --host 0.0.0.0 --port 1234 --metadata metadata.yaml

clean:
	rm -f $(db)

build: data
	docker build -t $(image) .

push: build
	docker tag $(image) $(hostname)/$(image):$(tag)
	docker push $(hostname)/$(image):$(tag)

deploy: push
	gcloud config set project $(gcp-project)
	gcloud run deploy $(cloud-run-service) \
	  --image $(hostname)/$(image):$(tag) \
	  --platform managed \
	  --region $(region) \
	  --service-account $(service-account) \
	  --no-allow-unauthenticated \
	  --port 8080 \
	  --platform managed

docker-auth:
	gcloud auth configure-docker $(region)-docker.pkg.dev