import * as core from '@actions/core'
import { execSync } from 'child_process'

export async function run() {
  const s3Bucket = process.env.S3_BUCKET
  const cloudFrontDistributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID
  const region = process.env.AWS_REGION
  const buildFolder = core.getInput('buildFolder')
  const buildPath = `./${buildFolder}`

  await uploadToS3({ region, buildPath, s3Bucket })
  await invalidateCloudFront({ region, cloudFrontDistributionId })
}

function runCommand(cmd: string, options = {}) {
  return execSync(cmd, {
    ...options,
    shell: '/bin/bash',
    encoding: 'utf-8'
  })
}

async function uploadToS3({
  region,
  s3Bucket,
  buildPath
}: {
  region: string | undefined
  s3Bucket: string | undefined
  buildPath: string
}) {
  runCommand(
    `aws --region ${region} s3 cp "${buildPath}" "s3://${s3Bucket}" --recursive`
  )
}

async function invalidateCloudFront({
  region,
  cloudFrontDistributionId
}: {
  region: string | undefined
  cloudFrontDistributionId: string | undefined
}) {
  runCommand(
    `aws --region ${region} cloudfront create-invalidation --distribution-id ${cloudFrontDistributionId} --paths /*`
  )
}
